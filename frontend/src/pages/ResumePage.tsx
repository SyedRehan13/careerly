import { FileText } from 'lucide-react'
import { FeaturePlaceholder } from '../components/common/FeaturePlaceholder'

export function ResumePage() {
  return (
    <FeaturePlaceholder
      icon={FileText}
      eyebrow="Tell your story"
      title="Resume workspace"
      description="Your experience deserves a thoughtful introduction."
      actionLabel="Build your career profile"
      actionTo="/app/profile"
      kind="resume"
      guideTitle="Give your next application a stronger introduction."
      steps={[
        { title: 'Start with your strengths', description: 'Write a clear headline and a short introduction in your career profile. Focus on the kind of work you want to do next.' },
        { title: 'Make your experience specific', description: 'List a few projects or accomplishments. Explain what you did, how you approached it, and what changed as a result.' },
        { title: 'Keep the role in mind', description: 'Revisit the job description in your saved opportunities. Choose examples that show the experience relevant to that role.' },
      ]}
      panelTitle="The right story for the right opportunity."
      panelDescription="A focused space for your resume is on the way. Resume uploads and tailoring aren't available yet, but you can already organize the roles you're working toward."
      features={[
        {
          title: 'One place for your experience',
          description: 'Keep a trusted base resume close at hand.',
        },
        {
          title: 'A considered version for each role',
          description: 'Shape your story around each opportunity.',
        },
        {
          title: 'More confidence before you send',
          description: 'Review clarity and relevance before applying.',
        },
      ]}
    />
  )
}
