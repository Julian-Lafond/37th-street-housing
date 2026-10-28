import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DUR, EASE } from "./motion";

// Loaded on demand (see loadMotion) so GSAP stays off the critical path.
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create(EASE.entrance, "0.22, 1, 0.36, 1");
CustomEase.create(EASE.transition, "0.65, 0, 0.35, 1");
gsap.defaults({ ease: EASE.entrance, duration: DUR.ui });

export { gsap, ScrollTrigger, SplitText };
