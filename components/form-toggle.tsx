"use client"
import React, { useState } from 'react'
import { MailForm } from './mail';
import { motion } from 'motion/react';

export const ContactButton = () => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const toggleModal = () => setModalOpen(!isModalOpen);
  return (
    <div>
      <div
        onClick={toggleModal}
        className="fixed bottom-5 right-4 cursor-pointer rounded-full p-4 bg-rose-500 hover:bg-rose-600 transition shadow-lg z-50 shadow-rose-500/50"
      >
        <IconMessage className="w-6 h-6 text-white" />
      </div>

      {/* Contact Modal */}
      {isModalOpen && (
        <motion.div className="fixed inset-0 z-40"
          initial={{
            opacity: 0,
            y: 100,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 100,
          }}
        >
          <MailForm />
        </motion.div>
      )}
    </div>
  )
}

const IconMessage = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"           // <— FORCE WHITE
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon icon-tabler icons-tabler-outline icon-tabler-message-circle"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1" />
    </svg>
  );
};

