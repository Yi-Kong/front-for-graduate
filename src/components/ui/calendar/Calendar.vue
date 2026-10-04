<script setup>
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CalendarRoot,
  CalendarHeader,
  CalendarHeading,
  CalendarGrid,
  CalendarGridHead,
  CalendarGridBody,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarCell,
  CalendarCellTrigger,
  CalendarNext,
  CalendarPrev,
} from 'reka-ui'

const props = defineProps({
  modelValue: { type: Object, required: false },
  minValue: { type: Object, required: false },
  maxValue: { type: Object, required: false },
  isDateDisabled: { type: Function, required: false },
  locale: { type: String, default: 'zh-CN' },
  class: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <CalendarRoot
    v-slot="{ weekDays, grid }"
    :model-value="modelValue"
    :min-value="minValue"
    :max-value="maxValue"
    :is-date-disabled="isDateDisabled"
    :locale="locale"
    @update:model-value="emit('update:modelValue', $event)"
    :class="cn('p-3', props.class)"
  >
    <CalendarHeader class="relative flex w-full items-center justify-center">
      <CalendarPrev :class="cn(buttonVariants({ variant: 'outline' }), 'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100')">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </CalendarPrev>
      <CalendarHeading class="text-sm font-medium" v-slot="{ headingValue }">
        <slot name="heading" :heading-value="headingValue">{{ headingValue }}</slot>
      </CalendarHeading>
      <CalendarNext :class="cn(buttonVariants({ variant: 'outline' }), 'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100')">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </CalendarNext>
    </CalendarHeader>

    <div class="mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse select-none space-y-1">
        <CalendarGridHead>
          <CalendarGridRow class="flex">
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              :class="cn('w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground')"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody class="grid">
          <CalendarGridRow
            v-for="(weekDates, index) in month.rows"
            :key="`weekDate-${index}`"
            class="mt-2 flex w-full"
          >
            <CalendarCell
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate"
              :class="cn('relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:bg-accent [&:has([data-selected][data-outside-view])]:bg-accent/50')"
            >
              <CalendarCellTrigger
                :day="weekDate"
                :month="month.value"
                :class="cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 data-[selected]:bg-[#C0202E] data-[selected]:text-white data-[selected]:opacity-100 data-[today]:bg-accent data-[today]:text-accent-foreground data-[outside-view]:text-muted-foreground')"
              />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
