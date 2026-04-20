import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { createAppRouter } from './create-app-router'

export function AppRouter() {
  const [router] = useState(createAppRouter)

  return <RouterProvider router={router} />
}
