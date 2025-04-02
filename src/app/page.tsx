import { Metadata } from 'next';

import HomePage from '@/app/(delete-this-and-modify-page.tsx)/HomePage';
import ChatBot from '@/components/ui/ChatBot';

export const metadata: Metadata = {
  title: 'Chatbots AI',
  description: 'Chatbots AI'
};

const Page = () => {
  return (
    <>
      <HomePage />
      <div className='mt-10 flex flex-col items-center gap-4 text-center'>
        <ChatBot promptType='coach' title='Coach Carter 🏀' />
        <ChatBot promptType='doctor' title='Docteur Maboul 🩺' />
        <h2 className='mt-10 text-2xl font-bold'>Lang Graph</h2>
        <ChatBot langGraph promptType='coach' title='Coach Carter 🏀 Lang Graph' />
        <ChatBot langGraph promptType='doctor' title='Docteur Maboul 🩺 Lang Graph' />
      </div>
    </>
  );
};

export default Page;
