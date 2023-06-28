<template>
  <div>
    <v-btn
      @click="showImagesFromFolder()"
      icon
      color="grey-darken-4"
      class="text-white"
    >
      <Icon width="30" icon="line-md:moon-filled-loop" />
    </v-btn>
    <span class="ml-5">Show Images From Folder</span>
    <ul id="images"></ul>
  </div>
</template>
<script setup lang="ts">
  function showImagesFromFolder() {
    window.electronAPI.openDirectorySelect().then(
      (paths: string[] | null) => {
        if (paths === null) {
          console.log("No folder selected")
          return
        } else if (paths === undefined) {
          console.log("Dialog was cancelled")
          return
        } else {
          let result:string = '';
          for (const path of paths) {
            result += `<div class="imgdevwarp"><img class="imgdevimg" src="${path}"></div>`;
          }
          document.getElementById("images")!.innerHTML = result;
        }
      }
    )
  }
</script>

<style>
.imgdevwarp {
  margin: 5px;
  width: 500px;
  height: 350px;
  line-height: 350px;
  text-align: center;
  background: #ccc;
  float: left;
}
.imgdevimg{
  display: inline-block;
  width: auto;
  height: auto;
  max-width: 500px;
  max-height: 100%;
  vertical-align: middle;
}
</style>