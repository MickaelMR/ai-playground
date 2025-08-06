import { Metadata } from 'next';

import HomePage from '@/app/(delete-this-and-modify-page.tsx)/HomePage';
import ChatBot from '@/components/ui/ChatBot';
import { PromptType } from '@/constants/prompt-system';

export const metadata: Metadata = {
  title: 'Chatbots AI',
  description: 'Chatbots AI'
};

const Page = () => {
  return (
    <>
      <div className='text-center mt-8 mb-8'>
        <h1 className='text-4xl font-bold mb-2'>🦄 AI Playground - Plateforme d'Assistants IA Spécialisés pour le Bien-être et la Productivité</h1>
        <p className='text-lg text-gray-600'>Accédez à 7 assistants IA experts : Madame Doubtfire (conseils parentaux), LinkedInBot Pro (recrutement), Coach Carter (coaching de vie), Docteur Maboul (conseils santé), Météo (planification), Dr. Phil Good (bien-être au travail) et Cloppy (arrêt du tabac)</p>
      </div>
      <HomePage />
      <div className='mt-10 flex flex-col items-center gap-4 text-center'>
        {/*  <ChatBot langGraph promptType={PromptType.COACH} title='Coach Carter 🏀 ' />
        <ChatBot langGraph promptType={PromptType.DOCTOR} title='Docteur Maboul 🩺 ' />
        <ChatBot langGraph promptType={PromptType.WEATHER} title='Météo 🌤️ ' />
        <ChatBot langGraph promptType={PromptType.WORKPLACE_WELLBEING} title='Dr. Phil Good 🧠 ' />
        <ChatBot langGraph promptType={PromptType.STOP_TABAC} title='Cloppy le Fumeur Repenti 🚭 ' /> */}
        <ChatBot langGraph promptType={PromptType.MADAME_DOUBTFIRE} title='Madame Doubtfire 👶 ' />
        <ChatBot langGraph promptType={PromptType.LINKEDIN_RECRUITER} title='LinkedInBot Pro 💼 ' />
      </div>
    </>
  );
};

export default Page;
