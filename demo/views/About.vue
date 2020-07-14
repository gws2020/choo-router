<template>
  <div class="about">
    <h1 @click="goC">This is an about page</h1>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
@Component({
  cache (data: {[key: string]: any} | null) {
    console.log('about cache data:', data)
    return {}
  }
})
export default class About extends Vue {
  public a: string = '1'
  public created () {
    console.log('===444555')
  }
  public goC() {
    console.log('===444click')
    this.$router.push({
      path: '/c'
    })
  }
}
</script>