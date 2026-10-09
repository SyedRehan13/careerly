import { MessagesSquare } from 'lucide-react'
import { FeaturePlaceholder } from '../components/common/FeaturePlaceholder'

export function InterviewPage() {
  return (
    <FeaturePlaceholder
      icon={MessagesSquare}
      eyebrow="Find your confidence"
      title="Interview preparation"
      description="Make room for a good conversation."
      actionLabel="Review your interviews"
      actionTo="/app/applications?status=interviewing"
      kind="interview"
      guideTitle="A little preparation goes a long way."
      steps={[
        { title: 'Understand the opportunity', description: 'Read the role again and explore the company’s work. Note what interests you and where your experience connects.' },
        { title: 'Prepare your stories', description: 'Choose a few examples from your work. Practice explaining the situation, your task, what you did, and the result.' },
        { title: 'Bring thoughtful questions', description: 'Write down what you want to learn about the team, the role, and expectations. Keep those questions in your application notes.' },
      ]}
      panelTitle="Walk in feeling like yourself."
      panelDescription="We're planning a calmer way to prepare for interviews. Practice sessions and preparation tools aren't available yet. For now, use your application notes to collect questions and ideas."
      features={[
        {
          title: 'Know the opportunity',
          description: 'Bring company research and role details together.',
        },
        {
          title: 'Find the words',
          description: 'Practice explaining the experience that matters.',
        },
        {
          title: 'Build a thoughtful plan',
          description: 'Keep preparation organized around each conversation.',
        },
      ]}
    />
  )
}
