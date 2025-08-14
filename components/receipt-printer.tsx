"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, Download, Share2 } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

interface ReceiptProps {
  orderNumber: string
  date: Date
  items: ReceiptItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  onClose: () => void
}

export function ReceiptPrinter({
  orderNumber,
  date,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  onClose,
}: ReceiptProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)

    // Simulate printing delay
    setTimeout(() => {
      setIsPrinting(false)
      // In a real app, this would trigger the actual print functionality
      window.print()
    }, 1500)
  }

  const handleDownload = () => {
    // In a real app, this would generate a PDF and trigger download
    alert("Receipt downloaded as PDF")
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog
    alert("Share functionality would open here")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center border-b pb-6">
        <CardTitle>Receipt</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-bold text-xl">Inventory POS System</h2>
            <p className="text-sm text-muted-foreground">123 Main Street, Anytown, CA 12345</p>
            <p className="text-sm text-muted-foreground">Tel: (555) 123-4567</p>
          </div>

          <div className="flex justify-between text-sm">
            <span>Order #: {orderNumber}</span>
            <span>
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          </div>

          <div className="border-t border-b py-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">Item</th>
                  <th className="text-center pb-2">Qty</th>
                  <th className="text-right pb-2">Price</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2">{item.name}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2">${item.price.toFixed(2)}</td>
                    <td className="text-right py-2">${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p>Payment Method: {paymentMethod}</p>
            <p className="text-sm text-muted-foreground">Thank you for your purchase!</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? <LoadingSpinner size="sm" className="mr-2" /> : <Printer className="mr-2 h-4 w-4" />}
            Print
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

