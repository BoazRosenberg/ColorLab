import { ShapeDefinition } from '../types/palette';

export const PCH_SHAPES: ShapeDefinition[] = [
  // 0 - 6: Simple open shapes
  { pch: 0, name: 'Open Square', category: 'open', hasBorderAndFill: false, description: 'Hollow square with stroke only' },
  { pch: 1, name: 'Open Circle', category: 'open', hasBorderAndFill: false, description: 'Default base R hollow circle' },
  { pch: 2, name: 'Open Triangle Up', category: 'open', hasBorderAndFill: false, description: 'Hollow upward triangle' },
  { pch: 3, name: 'Plus (+)', category: 'special', hasBorderAndFill: false, description: 'Orthogonal cross hair' },
  { pch: 4, name: 'Cross (x)', category: 'special', hasBorderAndFill: false, description: 'Diagonal saltire cross' },
  { pch: 5, name: 'Open Diamond', category: 'open', hasBorderAndFill: false, description: 'Hollow rhombus' },
  { pch: 6, name: 'Open Triangle Down', category: 'open', hasBorderAndFill: false, description: 'Hollow downward triangle' },

  // 7 - 14: Compound shapes
  { pch: 7, name: 'Square & Cross', category: 'special', hasBorderAndFill: false, description: 'Square containing diagonal cross' },
  { pch: 8, name: 'Star / Asterisk', category: 'special', hasBorderAndFill: false, description: 'Combined plus and cross' },
  { pch: 9, name: 'Diamond & Plus', category: 'special', hasBorderAndFill: false, description: 'Diamond containing orthogonal plus' },
  { pch: 10, name: 'Circle & Plus', category: 'special', hasBorderAndFill: false, description: 'Circle containing plus' },
  { pch: 11, name: 'Hexagram Triangles', category: 'special', hasBorderAndFill: false, description: 'Overlapped up & down triangles' },
  { pch: 12, name: 'Square & Plus', category: 'special', hasBorderAndFill: false, description: 'Square containing orthogonal plus' },
  { pch: 13, name: 'Circle & Cross', category: 'special', hasBorderAndFill: false, description: 'Circle containing diagonal cross' },
  { pch: 14, name: 'Square & Triangle', category: 'special', hasBorderAndFill: false, description: 'Inverted triangle inside square' },

  // 15 - 20: Solid shapes
  { pch: 15, name: 'Solid Square', category: 'solid', hasBorderAndFill: false, description: 'Filled square (color controls fill)' },
  { pch: 16, name: 'Solid Circle', category: 'solid', hasBorderAndFill: false, description: 'Default ggplot2 geom_point solid circle' },
  { pch: 17, name: 'Solid Triangle Up', category: 'solid', hasBorderAndFill: false, description: 'Filled upward triangle' },
  { pch: 18, name: 'Solid Diamond', category: 'solid', hasBorderAndFill: false, description: 'Filled rhombus' },
  { pch: 19, name: 'Large Solid Circle', category: 'solid', hasBorderAndFill: false, description: 'Solid circle with perimeter border' },
  { pch: 20, name: 'Bullet Point', category: 'solid', hasBorderAndFill: false, description: 'Small solid circle' },

  // 21 - 25: Both border (color) AND interior (fill) supported!
  { pch: 21, name: 'Fillable Circle', category: 'filled_bordered', hasBorderAndFill: true, description: 'Circle with border (colour) & interior (fill)' },
  { pch: 22, name: 'Fillable Square', category: 'filled_bordered', hasBorderAndFill: true, description: 'Square with border (colour) & interior (fill)' },
  { pch: 23, name: 'Fillable Diamond', category: 'filled_bordered', hasBorderAndFill: true, description: 'Diamond with border (colour) & interior (fill)' },
  { pch: 24, name: 'Fillable Triangle Up', category: 'filled_bordered', hasBorderAndFill: true, description: 'Triangle Up with border (colour) & interior (fill)' },
  { pch: 25, name: 'Fillable Triangle Down', category: 'filled_bordered', hasBorderAndFill: true, description: 'Triangle Down with border (colour) & interior (fill)' },
];
