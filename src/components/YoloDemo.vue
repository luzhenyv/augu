<template>
    <div class="Dropzone-page">
      <h1>YOLOv5 Demo</h1>
      <v-btn
        @click="showImagesFromFolder()"
        icon
        color="grey-darken-4"
        class="text-white"
      >
        <Icon width="30" icon="line-md:moon-filled-loop" />
      </v-btn>
      <span class="ml-5">Load Images</span>
      <div class="Dropzone" v-if = !state.loading>
        <div class="Dropzone-img-wrapper">
          <img
            alt="upload preview"
            @load="onImageChange($event)"
            class="Dropzone-img"
            id = "originalImage"
            :src= state.preview
          />
          <canvas id="canvas" width="640" height="640" />
        </div>
        <div class="Dropzone-predictions">
          <div v-if="state.predictions">
            Finishing
            <!-- <div v-for="prediction in state.predictions" :key="prediction.class">
              <div class="Dropzone-prediction">
                <div class="Dropzone-prediction-label">
                  {{ prediction.class }}
                </div>
                <div class="Dropzone-prediction-confidence">
                  {{ prediction.score.toFixed(2) }}
                </div>
              </div>
            </div> -->
          </div>
          <div v-else-if="state.loading">Loading...</div>
          <div v-else-if="state.error">Error: {{ state.error }}</div>
          <div v-else>No predictions</div>
        </div>
      </div>
      <div class="Dropzone" v-else>Loading model...</div>
  </div>
</template>

<script setup lang="ts">

import {reactive, onMounted} from "vue";
import * as tf from "@tensorflow/tfjs";

const weights = 'https://zldrobit.github.io/web_model/model.json'
const names = ['person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
               'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
               'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
               'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard',
               'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
               'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
               'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
               'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear',
               'hair drier', 'toothbrush']

let model: tf.GraphModel | null = null


interface Prediction {
  class: string;
  score: number;
}
interface State {
  preview: string;
  predictions: Prediction[];
  loading: boolean;
  error: string | null;
}

const state: State = reactive({
  model: null,
  preview: "",
  predictions: [],
  loading: false,
  error: null,
});

function cropToCanvas(image:HTMLImageElement, canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D) {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    // canvas.width = image.width;
    // canvas.height = image.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ratio = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const newWidth = Math.round(naturalWidth * ratio);
    const newHeight = Math.round(naturalHeight * ratio);
    ctx.drawImage(
      image,
      0,
      0,
      naturalWidth,
      naturalHeight,
      (canvas.width - newWidth) / 2,
      (canvas.height - newHeight) / 2,
      newWidth,
      newHeight,
    );
  };

function renderPredictions(output: tf.Tensor[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const font = "16px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";
  const [boxes, scores, classes, valid_detections] = output;
  const boxes_data = boxes.dataSync();
  const scores_data = scores.dataSync();
  const classes_data = classes.dataSync();
  const valid_detections_data = valid_detections.dataSync()[0];
  console.log(`boxes_data: ${boxes_data}`)
  console.log(`boxes_data.length: ${boxes_data.length}`)
  console.log(`scores: ${scores_data}`)
  console.log(`scores.length: ${scores_data.length}`)
  console.log(`classes: ${classes_data}`)
  console.log(`classes.length: ${classes_data.length}`)
  console.log(`valid_detections: ${valid_detections_data}`)
  // console.log(`valid_detections.length: ${valid_detections_data.length}`)
  tf.dispose(output)

  var i;
  for (i = 0; i < valid_detections_data; ++i){
    let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
    x1 *= canvas.width;
    x2 *= canvas.width;
    y1 *= canvas.height;
    y2 *= canvas.height;
    const width = x2 - x1;
    const height = y2 - y1;
    const klass = names[classes_data[i]];
    const score = scores_data[i].toFixed(2);

    // Draw the bounding box.
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 4;
    ctx.strokeRect(x1, y1, width, height);

    // Draw the label background.
    ctx.fillStyle = "#00FFFF";
    const textWidth = ctx.measureText(klass + ":" + score).width;
    const textHeight = parseInt(font, 10); // base 10
    ctx.fillRect(x1, y1, textWidth + 4, textHeight + 4);
  }
  for (i = 0; i < valid_detections_data; ++i){
    let [x1, y1, , ] = boxes_data.slice(i * 4, (i + 1) * 4);
    x1 *= canvas.width;
    y1 *= canvas.height;
    const klass = names[classes_data[i]];
    const score = scores_data[i].toFixed(2);

    // Draw the text last to ensure it's on top.
    ctx.fillStyle = "#000000";
    ctx.fillText(klass + ":" + score, x1, y1);
  }
}

async function onImageChange(event: Event) {
  const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  cropToCanvas(
    event.target as HTMLImageElement, 
    canvas, 
    ctx!,
  );
  console.log(`Model is ${model!.inputs[0].shape}`);
  let [modelWidth, modelHeight] = model!.inputs[0].shape!.slice(1, 3);
  const input = tf.tidy(() => {
      return tf.image.resizeBilinear(
        tf.browser.fromPixels(canvas), 
        [modelWidth, modelHeight])
        .div(255.0).expandDims(0);
    });
  const output = await model!.executeAsync(input) as tf.Tensor[];
  renderPredictions(output, canvas, ctx!);
};

function showImagesFromFolder(){
  window.electronAPI.openDirectorySelect().then(
      (paths: string[] | null) => {
        if (paths === null) {
          console.log("No folder selected")
          return
        } else if (paths === undefined) {
          console.log("Dialog was cancelled")
          return
        } else {
          state.preview = paths[0];
        }
      }
    )
}

onMounted(() => {
  state.loading = true;
  tf.loadGraphModel(weights).then((m) => {
    console.log(`Load Model is ${m.inputs[0].shape}`);
    model = m;
    state.loading = false;
  });
});

</script>

<style scoped>
.Dropzone-img {
  max-width: calc(100vw - 60px);
  max-height: calc(100vw - 60px);
  width: 640px;
  height: 640px;
  border: thin solid rgba(64, 64, 64, 0.15);
  border-radius: 4px;
  object-fit: cover;
  display: none;
}

.Dropzone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: thin dashed #c2c2c2;
  background: #fcfcfc;
  max-width: calc(100vw - 40px);
  max-height: calc(100vw - 40px);
  width: 660px;
  height: 660px;
  padding: 10px;
  border-radius: 5px;
  position: relative;
}

.Dropzone-page {
  margin: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.prediction {
  max-width: calc(100vw - 40px);
  width: 320;
  height: 320;
  display: flex;
  justify-content: space-between;
  padding: 10px 10px 0 10px;
}

#canvas {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 10px;
  right: 10px;
}
</style>