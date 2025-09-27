'use client';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Your payment has been processed via KiraPay
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                You will receive access to your purchased content shortly
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                A confirmation email will be sent to your registered email address
              </li>
            </ul>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return Home
            </button>
            <button
              onClick={() => window.location.href = '/store'}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Browse Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}