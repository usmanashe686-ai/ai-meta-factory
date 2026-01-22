import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import StoreProvider from '../components/providers/StoreProvider'

export default function App({ Component, pageProps }) {
  return (
    <StoreProvider>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </StoreProvider>
  )
}
