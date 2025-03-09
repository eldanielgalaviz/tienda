// src/hooks/use-toast.ts
import { useState } from "react"

export type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export type ToastActionElement = React.ReactElement<{
  altText: string
  onClick: () => void
}>

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = ToastProps & {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t } : t
          ),
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) => ({ ...t })),
      }
    }

    case actionTypes.REMOVE_TOAST: {
      const { toastId } = action

      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        }
      }

      return {
        ...state,
        toasts: [],
      }
    }
  }
}

export function useToast() {
  const [state, setState] = useState<State>({ toasts: [] })

  const toast = (props: Omit<ToasterToast, "id">) => {
    const id = genId()
    const newToast = { ...props, id }

    setState((state) => ({
      ...state,
      toasts: [newToast, ...state.toasts].slice(0, TOAST_LIMIT),
    }))

    return id
  }

  const update = (props: Partial<ToasterToast>) => {
    if (!props.id) {
      return
    }

    setState((state) => ({
      ...state,
      toasts: state.toasts.map((t) =>
        t.id === props.id ? { ...t, ...props } : t
      ),
    }))
  }

  const dismiss = (toastId?: string) => {
    setState((state) => ({
      ...state,
      toasts: state.toasts.filter((t) => t.id !== toastId),
    }))
  }

  const remove = (toastId?: string) => {
    if (toastId) {
      setState((state) => ({
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      }))
    } else {
      setState((state) => ({
        ...state,
        toasts: [],
      }))
    }
  }

  return {
    toast,
    update,
    dismiss,
    remove,
    toasts: state.toasts,
  }
}