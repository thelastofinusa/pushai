import React from "react"

export default function AuthLayout(props: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      {props.children}
    </div>
  )
}
