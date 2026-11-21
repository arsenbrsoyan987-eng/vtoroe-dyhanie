import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Directions from '../components/sections/Directions';
import UpcomingTrainings from '../components/sections/UpcomingTrainings';
import Trainers from '../components/sections/Trainers';
import Events from '../components/sections/Events';
import Testimonials from '../components/sections/Testimonials';
import CTA from '../components/sections/CTA';
import Gallery from '../components/sections/Gallery';
import Certificate from '../components/sections/Certificate';
import ClubLoyalty from '../components/sections/ClubLoyalty';
import Partners from '../components/sections/Partners';
import Locations from '../components/sections/Locations';
import DynamicSections from '../components/sections/DynamicSections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Directions />
      <Locations />
      <UpcomingTrainings />
      <Certificate />
      <ClubLoyalty />
      <Trainers />
      <Events />
      <Testimonials />
      <Partners />
      <Gallery />
      <DynamicSections />
      <CTA />
    </>
  );
}