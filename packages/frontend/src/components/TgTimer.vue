<template>
  <div>
    <h2>
      Timer: {{ msToTime(timerLocal) }}
    </h2>
  </div>
</template>

<script setup lang='ts'>

import { onMounted, PropType, Ref, ref, watch, computed } from 'vue'

const timerLocal: Ref<number> = ref(0)
const plusOne = computed(() => timerLocal.value + 1)

const props = defineProps({
  label: {
    type: String,
  },
  durationMsec: {
    type: Number as PropType<number | null>,
    default: null,
    required: false, // means it can be null
  },
})
let interval = null
const startTimer = (count: number) => {
  timerLocal.value = count
  interval = setInterval(() => {
    if (timerLocal.value <= 1000) {
      timerLocal.value = 0
      clearInterval(interval)
    }
    else {
      timerLocal.value -= 1000
    }
  }, 1000)

  return interval
}

watch(() => props.durationMsec, (count, prevCount) => {
  if (interval)
    clearInterval(interval)

  startTimer(count)
})

const timer: Ref<number> = ref(0)

onMounted (() => {
  timer.value = props.durationMsec

  if (timer.value > 0)
    startTimer(timer.value)
})

const msToTime = (duration: number) => {
  // const milliseconds = Math.floor((duration % 1000) / 100)
  let seconds: number | string = Math.floor((duration / 1000) % 60)
  let minutes: number | string = Math.floor((duration / (1000 * 60)) % 60)

  minutes = (minutes < 10) ? `0${minutes}` : minutes
  seconds = (seconds < 10) ? `0${seconds}` : seconds

  return `${minutes}:${seconds}`
}
console.log(msToTime(300000))

</script>

<style scoped>
.square {
    border: none;
    width: 10rem;
    height: 10rem;
    background: none;
    color: inherit;
    font-size: 3rem;
    font-weight: 700;
}
.square:hover {
    cursor: pointer;
}
.square:focus {
    outline: none;
    background: #41b88330;
}
.square:first-child,
.square:nth-child(2),
.square:nth-child(3) {
    border-top: none;
}
.square:nth-child(3),
.square:nth-child(6),
.square:last-child {
    border-right: none;
}
.square:nth-child(7),
.square:nth-child(8),
.square:last-child {
    border-bottom: none;
}
.square:first-child,
.square:nth-child(4),
.square:nth-child(7) {
    border-left: none;
}
</style>
