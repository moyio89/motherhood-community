"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeProps {
  children: React.ReactNode
  options?: any
  className?: string
}

export function Stripe({ children, options, className }: StripeProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    if (options?.mode === "payment" && options?.amount && options?.currency) {
      // Create a payment intent when the component mounts
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: options.amount,
          currency: options.currency,
        }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch((error) => console.error("Error creating payment intent:", error))
    }
  }, [options])

  return (
    <div className={className}>
      {clientSecret && options?.mode === "payment" ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          {children}
        </Elements>
      ) : (
        <Elements stripe={stripePromise}>{children}</Elements>
      )}
    </div>
  )
}
