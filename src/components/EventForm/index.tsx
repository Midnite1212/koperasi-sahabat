import { SubmitHandler, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'

import { useEventsContext } from '@/context/EventsContext'
import { useStateContext } from '@/context/StateContext'
import { IEvents } from '@/core/types'
import { EventTypes } from '@/mocks/dataResouces'
import { useEffect, useMemo, useState } from 'react'

interface IEventForm {
  event?: IEvents
}
type TimeRange = {
  start: Date,
  end: Date
}

export const EventForm = ({ event }: IEventForm) => {
  const { events, updateEventStorage, removeEventStorage, saveEventStorage } =
    useEventsContext()
  const { setModal } = useStateContext()
  const { register, handleSubmit, getValues, setValue } = useForm<IEvents>()
  const formValues = getValues();
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStartTime, setSelectedStartTime] = useState('')
  const [selectedEndTime, setSelectedEndTime] = useState('')
  const disabledTimeRanges = useMemo(
    () =>
      events.map((event) => {
        const currEventDate = new Date(event.date)
        const startTime = event.startDate.split(':')
        const endTime = event.endDate.split(':')
        return {
          start: new Date(
            currEventDate.getFullYear(),
            currEventDate.getMonth(),
            currEventDate.getDate(),
            Number(startTime[0]),
            Number(startTime[1])
          ),
          end: new Date(
            currEventDate.getFullYear(),
            currEventDate.getMonth(),
            currEventDate.getDate(),
            Number(endTime[0]),
            Number(endTime[1])
          )
        }
      }),
    [events]
  )

  const isCrahedTime = () => {
    const startHour = Number(formValues.startDate?.split(':')[0]);
    const startMinute = Number(formValues.startDate?.split(':')[1]);
    const endHour = Number(formValues.endDate?.split(':')[0]);
    const endMinute = Number(formValues.endDate?.split(':')[1]);
    // Get the disabled time for the selected dates
    const filterDisabledTimeRanges: TimeRange[] = disabledTimeRanges.filter((timeRange) => {
      const startDate = timeRange.start

      const disabledDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

      return disabledDate.toDateString() === new Date(selectedDate).toDateString()
    })
    //Translate to time in minutes
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    return filterDisabledTimeRanges.some((timeRange) => {
      const { start, end } = timeRange
      const disabledStart = start.getHours() * 60 + start.getMinutes()
      const disabledEnd = end.getHours() * 60 + end.getMinutes()
      // console.log(disabledStart, disabledEnd, startTime, endTime)
      // Case1: start time is between disabled range
      if (startTime >= disabledStart && startTime <= disabledEnd) return true
      // Case2: end time is between disabled range
      if (endTime >= disabledStart && endTime <= disabledEnd) return true
      // Case3: disabled range is between start and end time
      if (disabledStart >= startTime && disabledEnd <= endTime) return true
      // Case4: start and end time is between disabled range
      if (startTime >= disabledStart && endTime <= disabledEnd) return true
      return false
    })
  }

useEffect(() => {
  if(isCrahedTime()) {
    setValue('startDate', '')
    setValue('endDate', '')
  }
},[isCrahedTime, selectedDate, selectedStartTime, selectedEndTime, disabledTimeRanges])

  const onSubmit: SubmitHandler<IEvents> = (data) => {
    if (event) {
      updateEventStorage(data)
    } else {
      saveEventStorage(data)
    }
    setModal({ open: false })
  }
  return (
    <div className="flex w-full justify-center bg-primary p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col">
        <input
          {...register('id')}
          id="id"
          type="hidden"
          value={event?.id || uuidv4()}
        />
        <label htmlFor="title" className="text-sm font-medium">
          Title:
        </label>
        <input
          {...register('title', { required: true })}
          type="text"
          defaultValue={event?.title}
          className="mb-2 rounded-lg bg-search p-2 text-sm font-medium text-navTitle"
        />
        <label htmlFor="description" className="text-sm font-medium">
          Description:
        </label>
        <input
          {...register('description', { required: true })}
          type="text"
          defaultValue={event?.description}
          className="mb-2 rounded-lg bg-search p-2 text-sm font-medium text-navTitle"
        />
        <label htmlFor="date" className="text-sm font-medium">
          Date:
        </label>
        <input
          {...register('date', { required: true })}
          type="date"
          defaultValue={event?.date}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mb-2 rounded-lg bg-search p-2 text-sm font-medium text-navTitle"
        />
        <label htmlFor="time" className="text-sm font-medium">
          Start at:
        </label>
        <input
          {...register('startDate', { required: true })}
          type="time"
          defaultValue={event?.startDate}
          onChange={(e) => setSelectedStartTime(e.target.value)}
          className="mb-2 rounded-lg bg-search p-2 text-sm font-medium text-navTitle"
        />
        <label htmlFor="time" className="text-sm font-medium">
          End at:
        </label>
        <input
          {...register('endDate', { required: true })}
          type="time"
          onChange={(e) => setSelectedEndTime(e.target.value)}
          defaultValue={event?.endDate}

          className="mb-2 rounded-lg bg-search p-2 text-sm font-medium text-navTitle"
        />
        <label htmlFor="type" className="text-sm font-medium">
          Type of:
        </label>
        <select
          {...register('type', { required: true })}
          id="type"
          defaultValue={event?.type}
          className="mb-2 rounded-lg bg-search p-2 text-sm font-medium text-navTitle"
        >
          {EventTypes.map(({ id, text }) => (
            <option key={id.toString()} value={id}>
              {text}
            </option>
          ))}
        </select>
        {event ? (
          <span className="flex flex-row gap-x-2">
            <button className="mt-3 flex flex-1 justify-center rounded-lg bg-navHover py-2 px-4 text-primary transition-colors hover:bg-secondary hover:text-textHover">
              Update
            </button>
            <button
              className="mt-3 flex rounded-lg bg-deleteBtn py-2 px-4 transition-colors hover:bg-deleteBtnHover hover:text-secondary"
              onClick={(e) => {
                e.preventDefault()
                removeEventStorage(event.id)
                setModal({ open: false })
              }}
            >
              Delete
            </button>
          </span>
        ) : (
          <button className="mt-3 rounded-lg bg-navHover py-2 px-4 text-primary transition-colors hover:bg-secondary hover:text-textHover">
            Create
          </button>
        )}
      </form>
    </div>
  )
}
