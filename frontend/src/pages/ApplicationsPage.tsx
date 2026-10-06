import { ClipboardList } from 'lucide-react'
import { FeaturePlaceholder } from '../components/common/FeaturePlaceholder'

export function ApplicationsPage() {
  return <FeaturePlaceholder icon={ClipboardList} eyebrow="Track" title="Applications" description="Keep every application, status change, and follow-up organized." panelTitle="Your pipeline will live here" panelDescription="A clear application board will help you move roles from saved to applied, interviewing, and offer." actionLabel="Add an application" />
}

