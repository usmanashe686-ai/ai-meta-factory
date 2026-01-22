'use client';

export default function TestAnalytics() {
  const testEvent = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'test_button_click', {
        button_name: 'Test Analytics',
        location: 'test_page'
      });
      alert('Test event sent to Google Analytics!');
    } else {
      alert('Google Analytics not loaded. Make sure you have added your GA ID.');
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Analytics</h1>
      <button 
        onClick={testEvent}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Send Test Event to Google Analytics
      </button>
      <p className="mt-4 text-gray-600">
        Click the button to test if Google Analytics is working.
        Check your Google Analytics real-time dashboard to see the event.
      </p>
    </div>
  );
}
