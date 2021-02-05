const volume = document.getElementById('volume')
const bass = document.getElementById('bass')
const mid = document.getElementById('mid')
const treble = document.getElementById('treble')
const visualizer = document.getElementById('visualizer')
// const start = document.getElementById("start");
// const stop = document.getElementById("stop");
// const video = document.querySelector("video");
// const download = document.querySelector("a");
// let recorder, stream;


const context = new AudioContext()
const analyserNode = new AnalyserNode(context, { fftSize: 256 })
const gainNode = new GainNode(context, { gain: volume.value})
const bassEQ = new BiquadFilterNode(context, {
  type: 'lowshelf',
  frequency: 500,
  gain: bass.value
})
const midEQ = new BiquadFilterNode(context, {
  type: 'peaking',
  Q: Math.SQRT1_2,
  frequency: 1500,
  gain: mid.value
})
const trebleEQ = new BiquadFilterNode(context, {
  type: 'highshelf',
  frequency: 3000,
  gain: treble.value
})

setupEventListeners()
setupContext()
resize()
drawVisualizer()

function setupEventListeners() {
    //resize according to the device  - the visualization
  window.addEventListener('resize', resize)

  volume.addEventListener('input', e => {
    const value = parseFloat(e.target.value)
    gainNode.gain.setTargetAtTime(value, context.currentTime, .01)
  })

  bass.addEventListener('input', e => {
    const value = parseInt(e.target.value)
    bassEQ.gain.setTargetAtTime(value, context.currentTime, .01)
  })

  mid.addEventListener('input', e => {
    const value = parseInt(e.target.value)
    midEQ.gain.setTargetAtTime(value, context.currentTime, .01)
  })

  treble.addEventListener('input', e => {
    const value = parseInt(e.target.value)
    trebleEQ.gain.setTargetAtTime(value, context.currentTime, .01)
  })
}

async function setupContext() {
  const guitar = await getGuitar()
  if (context.state === 'suspended') {
    await context.resume()
  }
  const source = context.createMediaStreamSource(guitar)
  source
    .connect(bassEQ)
    .connect(midEQ)
    .connect(trebleEQ)
    .connect(gainNode)
    .connect(analyserNode)
    .connect(context.destination)
}

function getGuitar() {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppression: false,
      latency: 0
    }
  })
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer)

  const bufferLength = analyserNode.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyserNode.getByteFrequencyData(dataArray)
  const width = visualizer.width
  const height = visualizer.height
  const barWidth = width / bufferLength

  const canvasContext = visualizer.getContext('2d')
  canvasContext.clearRect(0, 0, width, height)

  dataArray.forEach((item, index) => {
    const y = item / 255 * height / 2
    const x = barWidth * index

    canvasContext.fillStyle = `hsl(${y / height * 400}, 100%, 50%)`
    canvasContext.fillRect(x, height - y, barWidth, y)
  })
}

function resize() {
  visualizer.width = visualizer.clientWidth * window.devicePixelRatio
  visualizer.height = visualizer.clientHeight * window.devicePixelRatio
}

// //media streaming

// async function startRecording() {
//     stream = await navigator.mediaDevices.getDisplayMedia({
//       video: { mediaSource: "screen" }
//     });
//     recorder = new MediaRecorder(stream);
  
//     const chunks = [];
//     recorder.ondataavailable = e => chunks.push(e.data);
//     recorder.onstop = e => {
//       const completeBlob = new Blob(chunks, { type: chunks[0].type });
//       video.src = URL.createObjectURL(completeBlob);
//     };
  
//     recorder.start();
//   }
  
//   start.addEventListener("click", () => {
//     start.setAttribute("disabled", true);
//     stop.removeAttribute("disabled");
  
//     startRecording();
//   });
  
//   stop.addEventListener("click", () => {
//     stop.setAttribute("disabled", true);
//     start.removeAttribute("disabled");
  
//     recorder.stop();
//     stream.getVideoTracks()[0].stop();
//   });
  