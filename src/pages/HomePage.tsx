import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Directions from '../components/sections/Directions';
import DynamicSections from '../components/sections/DynamicSections';
import UpcomingTrainings from '../components/sections/UpcomingTrainings';
import Trainers from '../components/sections/Trainers';
import Events from '../components/sections/Events';
import Gallery from '../components/sections/Gallery';
import Testimonials from '../components/sections/Testimonials';
import CTA from '../components/sections/CTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Directions />
      <DynamicSections />
      <UpcomingTrainings />
      <Trainers />
      <Events />
      <Gallery />
      <Testimonials />
      <CTA />
    </>
  );
}
