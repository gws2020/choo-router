<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
@Component({
  cache (data: {[key: string]: any} | null) {
    return {}
  }
})
export default class About extends Vue {
  public a: string = '1'
}
</script>