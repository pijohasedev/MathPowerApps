/* eslint-disable no-unused-vars */
import React from 'react';
import { renderToString } from 'react-dom/server';
import Latex from 'react-latex-next';
import katex from 'katex';

console.log(renderToString(<Latex>{"Kira nilai $\\frac{1}{2}$"}</Latex>));
