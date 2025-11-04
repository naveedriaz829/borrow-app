"use client"
import { useTranslation } from 'react-i18next'
import { KresusLoading } from "./KresusLoading"

interface FullPageLoadingProps {
  message?: string
}

const FullPageLoader = ({ message }: FullPageLoadingProps) => {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center h-screen bg-black z-50">
      <div className="font-['PolySans'] text-[20px] text-center h-full w-full flex items-center justify-center">
        <KresusLoading loadingText={message || t('common.loading')} />
      </div>
    </div>
  )
}

export default FullPageLoader