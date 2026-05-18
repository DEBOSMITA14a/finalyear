export const ratingLabels = {
  symptom: ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
  performance: ['Excellent', 'Above Average', 'Average', 'Problem', 'Problematic']
};

export const assessmentGroups = [
  {
    id: 'attention',
    title: 'Attention and Follow-Through',
    shortTitle: 'Attention',
    theme: 'mint',
    description: 'Details, listening, organization, distractibility, and daily follow-through.',
    questions: [
      'Does not pay attention to details or makes careless mistakes, for example with homework',
      'Has difficulty keeping attention to what needs to be done',
      'Does not seem to listen when spoken to directly',
      'Does not follow through when given directions and fails to finish activities',
      'Has difficulty organizing tasks and activities',
      'Avoids, dislikes, or does not want to start tasks that require ongoing mental effort',
      'Loses things necessary for tasks or activities',
      'Is easily distracted by noises or other stimuli',
      'Is forgetful in daily activities'
    ]
  },
  {
    id: 'activity',
    title: 'Activity and Impulse Control',
    shortTitle: 'Activity',
    theme: 'coral',
    description: 'Movement, quiet play, waiting, interrupting, and impulse timing.',
    questions: [
      'Fidgets with hands or feet or squirms in seat',
      'Leaves seat when remaining seated is expected',
      'Runs about or climbs too much when remaining seated is expected',
      'Has difficulty playing or beginning quiet play activities',
      'Is on the go or often acts as if driven by a motor',
      'Talks too much',
      'Blurts out answers before questions have been completed',
      'Has difficulty waiting his or her turn',
      'Interrupts or intrudes in on others conversations and/or activities'
    ]
  },
  {
    id: 'oppositional',
    title: 'Oppositional Patterns',
    shortTitle: 'Opposition',
    theme: 'gold',
    description: 'Temper, arguing, refusal, blame, anger, and resentment patterns.',
    questions: [
      'Argues with adults',
      'Loses temper',
      'Actively defies or refuses to go along with adults requests or rules',
      'Deliberately annoys people',
      'Blames others for his or her mistakes or misbehaviors',
      'Is touchy or easily annoyed by others',
      'Is angry or resentful',
      'Is spiteful and wants to get even'
    ]
  },
  {
    id: 'conduct',
    title: 'Conduct and Safety',
    shortTitle: 'Safety',
    theme: 'blue',
    description: 'Aggression, property safety, truancy, cruelty, weapons, and serious risk behaviors.',
    questions: [
      'Bullies, threatens, or intimidates others',
      'Starts physical fights',
      'Lies to get out of trouble or to avoid obligations',
      'Is truant from school without permission',
      'Is physically cruel to people',
      'Has stolen things that have value',
      'Deliberately destroys others property',
      'Has used a weapon that can cause serious harm',
      'Is physically cruel to animals',
      'Has deliberately set fires to cause damage',
      'Has broken into someone else home, business, or car',
      'Has stayed out at night without permission',
      'Has run away from home overnight',
      'Has forced someone into sexual activity'
    ]
  },
  {
    id: 'emotional-performance',
    title: 'Emotional Wellbeing and Performance',
    shortTitle: 'Wellbeing',
    theme: 'rose',
    description: 'Worry, self-worth, sadness, school performance, relationships, and organized activities.',
    questions: [
      'Is fearful, anxious, or worried',
      'Is afraid to try new things for fear of making mistakes',
      'Feels worthless or inferior',
      'Blames self for problems, feels guilty',
      'Feels lonely, unwanted, or unloved',
      'Is sad, unhappy, or depressed',
      'Is self-conscious or easily embarrassed',
      'Overall school performance',
      'Reading',
      'Writing',
      'Mathematics',
      'Relationship with parents',
      'Relationship with siblings',
      'Relationship with peers',
      'Participation in organized activities'
    ]
  }
];

let questionNumber = 1;

export const assessmentSections = assessmentGroups.map((group) => ({
  ...group,
  questions: group.questions.map((text, index) => {
    const number = questionNumber++;
    const type = number >= 48 ? 'performance' : 'symptom';

    return {
      id: number,
      text,
      type,
      domain: group.id,
      localIndex: index + 1
    };
  })
}));

export const allQuestions = assessmentSections.flatMap((section) => section.questions);
