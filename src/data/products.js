
import p_img1 from "./img1.jpg";
import p_img2_1 from "./img1_2.jpg";
import p_img3 from "./img1_3.jpg";
import p_img4 from "./img1_4.jpg";


import p_img5 from "./sleeve1.jpg";
import p_img6 from "./sleeve2.jpg";
import p_img7 from "./sleeve3.jpg";
import p_img8 from "./sleeve4.jpg";
import p_img9 from "./sleeve5.jpg";

import p_img10 from "./gard1.jpg";
import p_img11 from "./gard2.jpg";
import p_img12 from "./gard3.jpg";
import p_img13 from "./gard4.jpg";
import p_img14 from "./gard5.jpg";


import p_img15 from "./glass1.jpg";
import p_img16 from "./glass1_2.jpg";
import p_img17 from "./glass1_3.jpg";
import p_img18 from "./glass2.jpg";
import p_img19 from "./glass2_2.jpg";
import p_img20 from "./glass2_3.jpg";
import p_img21 from "./glass2_4.jpg";



export const products = [
  {
    _id: "aaaaa",
    name: "Men's Brighton Jersey",
    description: "NB Dry Moisture management system 100% Polyester Athletic Fit Mesh back panel to jersey for breath ability and comfort NB heat transfer logo to right chest Choose from 11 different colors Imported",
    price: 100,
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L"],
    date: 1716634345448,
    bestseller: true,
    variants: [
     
      {
        color: "Black",
        images: [p_img1, p_img2_1],
      },
      {
        color: 'Yellow',
        images: [p_img3, p_img4],
      }
    ],
  },
   {
    _id: "aaaab",
    name: "Knit Arm Sleeve",
    description: "Lizard Skins Performance Arm Sleeve combines comfort with style. Keep your arm loose and warm with the compression fit arm sleeve. 80% polyester  20% spandex 3 silicone strips on the inside of the cuff to hold arm sleeve in place Full length to completely cover the bicep Available in youth and adult sizes",
    price: 22.40,
    category: "Both",
    subCategory: "Bottomwear",
     brand: "skin accessories",
     type: " accessories",
    sizes: ["Youth S", "Youth M", "Youth L"],
    date: 1716634345448,
    bestseller: true,
    variants: [
     
      {
        color: "Black",
        images: [p_img5, p_img9],
      },
      {
        color: 'White',
        images: [p_img6],
      },
      {
        color: 'Gray',
        images: [p_img7],
      },
      {
        color: 'Navy',
        images: [p_img8],
      }

    ],
  },
  {
    _id: "aaaac",
    name: "Elite Speed Batter Elbow Guard",
    description: "Featuring SmartFlex™: Flexible During Play. Hardens on Impact.•Body-mapped, impact absorbing SmartFlex™ pads offer form-fitting and lightweight protection that is flexible as you ride and hardens on impact •Extended coverage for superior elbow and upper arm protection •SmartFlex™ backed with a Polypro pre-curved shell provides the ultimate in protection •Foam layer for increased comfort •Adjustable straps for versatile fit and quick on/off •Durable fabric cover •Machine washable",
    price: 38.50,
    category: "Men",
    subCategory: "Accessories",
     brand: "gear",
     type: "gard",
    sizes: ["S", "M", "L","XL"],
    date: 1716634345448,
    bestseller: true,
    variants: [
     
      {
        color: "Black",
        images: [p_img10],
      },
      {
        color: 'White',
        images: [p_img11],
      },
      {
        color: 'Royal',
        images: [p_img12],
      },
      {
        color: 'Navy',
        images: [p_img13],
      },
      {
        color: 'Gray',
        images: [p_img14]
      }
      
    ],
  },

  {
    _id: "aaaad",
    name: "Sutro Lite",
    description: "The Sutro family expands with a semi-rimless version of the popular style for greater field of view. Inspired by the daily life of urban cyclists, the high-wrap shield creates a bold, versatile look, protects from the elements and enhances vision with Prizm™ Lens Technology, while inspiring athletes to move confidently and seamlessly through their day. • Available with Prizm™ lenses that are designed to enhance color and contrast so you can see more detail • A high-wrap, semi-rimless frame designed to increase field of view and improved ventilation • O Matter™ frame material provides durability and all-day comfort to keep up with life on-the-go • Ridged textured Unobtainium® added to the inside of the temple for retention • Oakley’s Unobtainium® nosepads provide increased comfort and performance and increase grip with sweat",
    price: 135.80,
    category: "Both",
    subCategory: "Accessories",
     brand: "oakley",
     type: "performance",
    sizes: ["S", "M", "L"],
    date: 1716634345448,
    bestseller: true,
    variants: [
     
      {
        color: "Black",
        images: [p_img15, p_img16, p_img17],
      },
      {
        color: 'White',
        images: [p_img18, p_img19, p_img20, p_img21],
      },
     
      
    ],
  },
 
];