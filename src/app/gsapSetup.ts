import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);
CustomEase.create("klaassens", "0.625, 0.05, 0, 1");
CustomEase.create("parallax", "0.7, 0.05, 0.13, 1");

export { gsap, ScrollTrigger, SplitText };
