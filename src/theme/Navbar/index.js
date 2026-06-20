import React, {useState, useEffect} from 'react';
import Navbar from '@theme-original/Navbar';
import {motion, AnimatePresence} from 'framer-motion';

export default function NavbarWrapper(props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (scrolled) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, [scrolled]);

  return <Navbar {...props} />;
}