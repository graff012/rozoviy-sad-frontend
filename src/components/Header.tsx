import { Link, useNavigate } from "react-router-dom";
import { IoSearchSharp } from "react-icons/io5";
import {
  FaCartShopping,
  FaPhone,
  FaUserShield,
  FaBars,
} from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../contexts/CartContext";
import { API_URL } from "../config";

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

interface Flower {
  id: string;
  name: string;
  smell: string;
  flowerSize: string;
  height: string;
  imgUrl?: string;
  categoryId: string;
  price: string;
  isLiked?: boolean;
}

const Header = ({ searchTerm, setSearchTerm }: HeaderProps) => {
  const [inputValue, setInputValue] = useState(searchTerm);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Flower[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const { itemCount } = useCart();

  // Enhanced SVG logo component - made larger and more prominent
  const MainLogo = ({ isMobile = false }) => (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 520 350"
        width={isMobile ? "280" : "450"}
        height={isMobile ? "180" : "270"}
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto drop-shadow-lg"
        preserveAspectRatio="xMidYMid meet"
        style={{
          transform: 'translateY(-70px)',
          maxWidth: '100%',
          height: 'auto',
        }}
      >
        {/* Flower Paths */}
        <path d="M 79,316 L 79,323 L 80,324 L 80,328 L 81,329 L 81,330 L 82,331 L 82,332 L 83,333 L 83,334 L 84,335 L 84,336 L 88,340 L 89,340 L 92,343 L 93,343 L 94,344 L 95,344 L 96,345 L 98,345 L 99,346 L 101,346 L 102,347 L 110,347 L 111,348 L 113,348 L 114,347 L 118,347 L 119,346 L 120,346 L 121,345 L 122,345 L 126,341 L 126,340 L 127,339 L 126,339 L 125,340 L 124,340 L 123,341 L 121,341 L 120,342 L 106,342 L 105,341 L 104,341 L 103,340 L 102,340 L 101,339 L 100,339 L 99,338 L 98,338 L 97,337 L 96,337 L 92,333 L 91,333 L 86,328 L 86,327 L 85,327 L 83,325 L 83,324 L 82,323 L 82,321 L 81,320 L 81,319 L 80,318 L 80,317 Z" fill="#FF4444" stroke="none" />
        <path d="M 134,314 L 132,316 L 132,318 L 128,322 L 128,323 L 127,324 L 126,324 L 123,327 L 122,327 L 121,328 L 120,328 L 118,330 L 117,330 L 116,331 L 114,331 L 113,332 L 111,332 L 110,333 L 105,333 L 104,334 L 101,334 L 102,335 L 103,335 L 104,336 L 105,336 L 106,337 L 107,337 L 108,338 L 111,338 L 112,339 L 115,339 L 116,338 L 119,338 L 120,337 L 122,337 L 126,333 L 127,333 L 129,331 L 129,329 L 131,327 L 131,325 L 133,323 L 133,320 L 134,319 L 134,315 L 135,314 Z" fill="#FF4444" stroke="none" />
        <path d="M 75,306 L 74,307 L 74,308 L 73,309 L 73,310 L 72,311 L 72,312 L 71,313 L 71,314 L 70,315 L 70,317 L 69,318 L 69,320 L 68,321 L 68,330 L 69,331 L 69,335 L 70,336 L 70,337 L 71,338 L 71,339 L 79,347 L 80,347 L 81,348 L 84,348 L 85,349 L 87,349 L 88,350 L 98,350 L 99,349 L 96,349 L 95,348 L 94,348 L 93,347 L 92,347 L 91,346 L 89,346 L 85,342 L 84,342 L 83,341 L 83,340 L 82,339 L 81,339 L 80,338 L 80,336 L 78,334 L 78,333 L 77,332 L 77,331 L 76,330 L 76,328 L 75,327 Z" fill="#FF4444" stroke="none" />
        <path d="M 108,296 L 107,297 L 107,298 L 106,299 L 106,309 L 110,309 L 111,308 L 112,308 L 113,307 L 114,307 L 115,306 L 115,303 L 114,302 L 114,301 L 109,296 Z" fill="#FF4444" stroke="none" />
        <path d="M 126,291 L 126,296 L 127,297 L 127,311 L 126,312 L 126,316 L 128,316 L 130,314 L 130,313 L 131,312 L 131,310 L 132,309 L 132,306 L 133,305 L 133,304 L 132,303 L 132,301 L 131,300 L 131,298 L 129,296 L 129,295 L 128,294 L 128,293 Z" fill="#FF4444" stroke="none" />
        <path d="M 99,289 L 98,290 L 97,290 L 95,292 L 94,292 L 89,297 L 89,298 L 86,301 L 86,302 L 85,303 L 85,306 L 84,307 L 84,315 L 85,316 L 85,317 L 86,318 L 86,319 L 87,320 L 87,321 L 88,322 L 88,323 L 92,327 L 93,327 L 94,328 L 95,328 L 96,329 L 98,329 L 99,330 L 107,330 L 108,329 L 111,329 L 112,328 L 113,328 L 114,327 L 115,327 L 117,325 L 118,325 L 118,324 L 121,321 L 121,318 L 122,317 L 122,315 L 123,314 L 123,303 L 122,303 L 122,304 L 121,305 L 121,306 L 117,310 L 116,310 L 114,312 L 113,312 L 112,313 L 109,313 L 108,314 L 96,314 L 93,311 L 93,310 L 92,309 L 92,304 L 93,303 L 93,300 L 94,299 L 94,298 L 95,297 L 95,295 L 99,291 L 99,290 L 100,289 Z" fill="#FF4444" stroke="none" />
        <path d="M 110,286 L 109,287 L 108,287 L 106,289 L 105,289 L 102,292 L 102,293 L 99,296 L 99,297 L 98,298 L 98,300 L 97,301 L 97,303 L 96,304 L 96,307 L 97,308 L 97,309 L 98,310 L 100,310 L 100,307 L 101,306 L 101,299 L 103,297 L 103,295 L 106,292 L 107,292 L 108,291 L 110,293 L 111,293 L 118,300 L 119,300 L 120,299 L 120,297 L 121,296 L 121,290 L 122,289 L 121,288 L 121,287 L 120,287 L 119,286 Z" fill="#FF4444" stroke="none" />
        <path d="M 122,281 L 122,282 L 124,284 L 125,284 L 126,285 L 126,286 L 127,287 L 128,287 L 130,289 L 130,290 L 133,293 L 133,294 L 134,295 L 134,296 L 135,297 L 135,298 L 136,299 L 136,300 L 137,301 L 137,302 L 138,303 L 138,308 L 139,309 L 139,312 L 138,313 L 138,320 L 137,321 L 137,322 L 136,323 L 136,324 L 135,325 L 135,327 L 134,328 L 134,330 L 132,332 L 132,334 L 134,334 L 135,333 L 136,333 L 138,331 L 140,331 L 142,329 L 143,329 L 147,325 L 147,324 L 149,322 L 149,321 L 151,319 L 151,312 L 148,309 L 148,308 L 147,307 L 147,305 L 150,302 L 150,298 L 149,297 L 149,295 L 146,292 L 146,291 L 145,290 L 144,290 L 141,287 L 140,287 L 139,286 L 138,286 L 137,285 L 136,285 L 135,284 L 133,284 L 132,283 L 131,283 L 130,282 L 126,282 L 125,281 Z" fill="#FF4444" stroke="none" />
        <path d="M 95,277 L 94,278 L 92,278 L 90,280 L 89,280 L 83,286 L 83,287 L 82,288 L 82,290 L 81,291 L 81,292 L 80,293 L 80,302 L 81,301 L 82,301 L 83,300 L 83,298 L 86,295 L 86,294 L 91,289 L 92,289 L 94,287 L 95,287 L 96,286 L 97,286 L 98,285 L 100,285 L 101,284 L 102,284 L 103,283 L 108,283 L 109,282 L 119,282 L 118,282 L 115,279 L 114,279 L 113,278 L 109,278 L 108,277 Z" fill="#FF4444" stroke="none" />

        {/* Main Logo Text Path */}
        <path d="M 193,335 L 192,336 L 174,336 L 173,337 L 165,337 L 164,338 L 160,338 L 159,339 L 153,339 L 152,340 L 149,340 L 148,341 L 145,341 L 144,342 L 141,342 L 140,343 L 139,343 L 138,344 L 136,344 L 135,345 L 134,345 L 133,346 L 131,346 L 130,347 L 127,347 L 125,345 L 123,347 L 123,348 L 124,349 L 123,350 L 122,350 L 122,351 L 121,352 L 120,352 L 118,354 L 117,354 L 113,358 L 111,358 L 110,357 L 109,357 L 108,356 L 105,356 L 104,355 L 93,355 L 92,356 L 87,356 L 86,357 L 84,357 L 83,358 L 81,358 L 79,360 L 77,360 L 75,362 L 74,362 L 74,363 L 75,364 L 76,364 L 77,365 L 80,365 L 81,366 L 82,366 L 83,367 L 84,367 L 85,368 L 86,368 L 87,369 L 88,369 L 91,372 L 92,372 L 93,373 L 94,373 L 96,375 L 97,375 L 100,378 L 100,379 L 99,380 L 100,381 L 99,382 L 100,383 L 99,384 L 100,385 L 100,388 L 101,389 L 101,390 L 102,391 L 103,391 L 105,393 L 109,393 L 110,392 L 114,392 L 116,390 L 117,390 L 118,389 L 119,389 L 119,388 L 120,387 L 121,387 L 121,386 L 123,384 L 123,383 L 124,382 L 124,381 L 125,380 L 125,379 L 126,378 L 126,377 L 127,376 L 127,372 L 128,371 L 128,370 L 129,369 L 131,371 L 131,373 L 132,374 L 132,375 L 136,375 L 137,376 L 138,376 L 139,375 L 142,375 L 143,374 L 144,374 L 145,373 L 147,373 L 148,372 L 149,372 L 149,371 L 150,370 L 151,370 L 152,369 L 153,369 L 155,367 L 156,367 L 157,366 L 158,366 L 159,365 L 161,365 L 162,364 L 164,364 L 165,363 L 165,362 L 164,362 L 162,360 L 160,360 L 158,358 L 156,358 L 155,357 L 153,357 L 152,356 L 140,356 L 139,355 L 139,354 L 139,355 L 140,356 L 139,357 L 138,357 L 137,358 L 135,358 L 133,360 L 132,360 L 131,361 L 131,362 L 130,363 L 129,362 L 129,359 L 128,358 L 128,356 L 130,354 L 131,354 L 132,353 L 133,353 L 134,352 L 136,352 L 137,351 L 139,351 L 140,350 L 142,350 L 143,349 L 145,349 L 146,348 L 149,348 L 150,347 L 154,347 L 155,346 L 158,346 L 159,345 L 169,345 L 170,344 L 175,344 L 176,343 L 233,343 L 234,344 L 242,344 L 243,345 L 252,345 L 253,346 L 260,346 L 261,347 L 269,347 L 270,348 L 274,348 L 275,349 L 280,349 L 281,350 L 286,350 L 287,351 L 292,351 L 293,352 L 295,352 L 296,353 L 299,353 L 300,354 L 305,354 L 306,355 L 309,355 L 310,356 L 311,356 L 312,357 L 316,357 L 317,358 L 321,358 L 322,359 L 324,359 L 325,360 L 326,360 L 327,361 L 329,361 L 330,362 L 334,362 L 335,363 L 337,363 L 338,364 L 339,364 L 340,365 L 342,365 L 343,366 L 345,366 L 346,367 L 348,367 L 349,368 L 350,368 L 351,369 L 352,369 L 353,370 L 355,370 L 357,372 L 359,372 L 360,373 L 361,373 L 362,374 L 363,374 L 364,375 L 365,375 L 366,376 L 367,376 L 369,378 L 369,379 L 371,379 L 372,380 L 373,380 L 374,381 L 376,381 L 377,382 L 378,382 L 379,383 L 379,382 L 378,382 L 374,378 L 373,378 L 369,374 L 368,374 L 366,372 L 365,372 L 364,371 L 363,371 L 362,370 L 361,370 L 360,369 L 359,369 L 358,368 L 357,368 L 356,367 L 355,367 L 353,365 L 350,365 L 348,363 L 346,363 L 345,362 L 344,362 L 343,361 L 342,361 L 341,360 L 339,360 L 338,359 L 337,359 L 336,358 L 334,358 L 333,357 L 331,357 L 330,356 L 328,356 L 327,355 L 326,355 L 325,354 L 322,354 L 321,353 L 319,353 L 318,352 L 314,352 L 313,351 L 311,351 L 310,350 L 308,350 L 307,349 L 304,349 L 303,348 L 299,348 L 298,347 L 296,347 L 295,346 L 292,346 L 291,345 L 287,345 L 286,344 L 282,344 L 281,343 L 278,343 L 277,342 L 271,342 L 270,341 L 266,341 L 265,340 L 258,340 L 257,339 L 251,339 L 250,338 L 244,338 L 243,337 L 233,337 L 232,336 L 219,336 L 218,335 Z" fill="#22C55E" stroke="none" />
        <path d="M 518,319 L 517,320 L 517,323 L 520,326 L 521,325 L 522,325 L 524,323 L 524,320 L 523,319 Z" fill="#22C55E" stroke="none" />

        {/* Text Paths with Holes */}
        {/* Letter О (with hole) */}
        <path
          d="M 206,293 L 205,294 L 204,294 L 203,295 L 202,295 L 198,299 L 198,300 L 197,301 L 197,302 L 196,303 L 196,315 L 197,316 L 196,317 L 197,318 L 197,319 L 198,320 L 199,320 L 202,323 L 203,323 L 204,324 L 206,324 L 207,325 L 208,325 L 209,326 L 210,326 L 211,325 L 216,325 L 217,324 L 219,324 L 220,323 L 222,323 L 223,322 L 223,321 L 227,317 L 227,315 L 228,314 L 228,304 L 227,303 L 227,302 L 226,301 L 226,300 L 225,299 L 225,298 L 224,298 L 221,295 L 220,295 L 219,294 L 217,294 L 216,293 Z
           M 210,300 L 215,300 L 215,315 L 210,315 Z"
          fill="#22C55E"
          fillRule="evenodd"
          stroke="none"
        />

        {/* Letter Д (with hole) */}
        <path
          d="M 269,292 L 267,294 L 265,294 L 258,301 L 258,302 L 257,303 L 257,314 L 258,315 L 258,318 L 263,323 L 264,323 L 265,324 L 267,324 L 268,325 L 278,325 L 279,324 L 281,324 L 282,323 L 283,323 L 287,319 L 287,318 L 288,317 L 288,316 L 289,315 L 289,313 L 290,312 L 289,311 L 289,303 L 287,301 L 287,300 L 281,294 L 279,294 L 278,293 L 274,293 L 273,294 L 272,294 L 270,292 Z
           M 275,300 L 280,300 L 280,315 L 275,315 Z"
          fill="#22C55E"
          fillRule="evenodd"
          stroke="none"
        />

        {/* Letter В (with hole) */}
        <path
          d="M 299,293 L 298,294 L 294,294 L 294,295 L 295,295 L 296,296 L 296,303 L 297,304 L 297,306 L 296,307 L 296,323 L 295,324 L 296,325 L 310,325 L 311,324 L 315,324 L 316,323 L 317,323 L 318,322 L 319,322 L 319,321 L 320,320 L 320,319 L 321,318 L 321,316 L 320,315 L 320,312 L 318,310 L 316,310 L 314,308 L 315,307 L 316,307 L 319,304 L 319,299 L 318,298 L 318,297 L 316,295 L 315,295 L 314,294 L 300,294 Z
           M 305,300 L 310,300 L 310,315 L 305,315 Z"
          fill="#22C55E"
          fillRule="evenodd"
          stroke="none"
        />

        {/* Remaining Text Paths */}
        <path d="M 465,294 L 464,295 L 464,296 L 463,297 L 463,298 L 462,299 L 462,300 L 461,301 L 461,302 L 459,304 L 460,305 L 459,306 L 459,309 L 457,311 L 457,312 L 456,313 L 456,314 L 455,315 L 455,317 L 454,318 L 454,319 L 453,320 L 452,320 L 452,321 L 451,322 L 451,323 L 450,324 L 451,325 L 456,325 L 457,324 L 455,322 L 455,319 L 456,318 L 456,317 L 457,316 L 458,317 L 459,316 L 460,316 L 461,315 L 465,315 L 466,316 L 467,316 L 469,318 L 469,319 L 470,320 L 470,324 L 471,325 L 473,325 L 474,326 L 475,325 L 478,325 L 479,324 L 480,325 L 481,325 L 482,326 L 482,329 L 483,330 L 483,332 L 483,331 L 485,329 L 486,329 L 486,328 L 488,326 L 489,326 L 490,325 L 506,325 L 508,327 L 509,327 L 512,330 L 512,332 L 513,333 L 513,331 L 514,330 L 514,327 L 513,326 L 513,324 L 512,324 L 509,321 L 509,298 L 510,297 L 510,296 L 511,295 L 511,294 L 490,294 L 492,296 L 492,298 L 493,299 L 493,303 L 492,304 L 492,311 L 491,312 L 491,315 L 490,316 L 490,318 L 489,319 L 489,320 L 488,321 L 486,321 L 486,322 L 485,323 L 484,323 L 483,324 L 480,324 L 478,322 L 478,320 L 477,319 L 477,318 L 476,317 L 476,316 L 475,315 L 475,313 L 474,312 L 474,311 L 473,310 L 473,309 L 472,308 L 472,307 L 471,306 L 471,305 L 470,304 L 470,303 L 469,302 L 469,300 L 468,299 L 468,297 L 466,295 L 466,294 Z" fill="#22C55E" stroke="none" />
        <path d="M 168,294 L 170,296 L 170,302 L 171,303 L 171,319 L 170,320 L 170,323 L 169,324 L 170,324 L 171,325 L 178,325 L 179,324 L 180,324 L 179,323 L 179,322 L 178,321 L 178,311 L 179,310 L 179,309 L 178,308 L 178,297 L 180,295 L 181,295 L 182,296 L 182,297 L 183,297 L 184,298 L 184,301 L 185,302 L 185,303 L 183,305 L 183,307 L 181,309 L 181,310 L 184,310 L 185,311 L 187,309 L 188,309 L 189,308 L 190,308 L 191,307 L 191,305 L 192,304 L 192,300 L 191,299 L 191,297 L 190,296 L 189,296 L 188,295 L 187,295 L 186,294 Z" fill="#22C55E" stroke="none" />
        <path d="M 572,293 L 571,294 L 566,294 L 565,295 L 564,295 L 563,294 L 562,295 L 562,296 L 563,297 L 563,303 L 564,302 L 565,302 L 564,301 L 564,300 L 565,299 L 565,298 L 567,296 L 568,296 L 569,295 L 570,296 L 571,295 L 572,296 L 572,297 L 574,299 L 574,303 L 573,304 L 573,305 L 570,308 L 569,308 L 568,309 L 567,309 L 568,309 L 569,310 L 570,310 L 571,311 L 572,311 L 573,312 L 573,313 L 575,315 L 575,319 L 571,323 L 570,323 L 569,324 L 568,324 L 567,323 L 566,323 L 565,322 L 562,322 L 562,323 L 564,325 L 572,325 L 573,326 L 574,325 L 577,325 L 578,324 L 579,324 L 580,323 L 581,323 L 581,322 L 582,321 L 582,320 L 583,319 L 583,314 L 579,310 L 578,310 L 577,309 L 577,308 L 578,307 L 579,307 L 579,306 L 581,304 L 581,303 L 582,302 L 582,299 L 581,298 L 581,297 L 578,294 L 576,294 L 575,293 Z" fill="#22C55E" stroke="none" />
        <path d="M 536,293 L 535,294 L 528,294 L 529,295 L 530,295 L 531,296 L 531,297 L 532,298 L 532,299 L 533,300 L 533,301 L 534,302 L 534,303 L 535,304 L 535,305 L 536,306 L 536,307 L 538,309 L 538,310 L 539,311 L 539,312 L 541,314 L 541,315 L 542,316 L 542,317 L 543,318 L 543,319 L 542,320 L 542,321 L 541,322 L 540,321 L 540,320 L 538,320 L 537,319 L 536,319 L 535,318 L 534,318 L 533,319 L 533,320 L 532,321 L 532,322 L 533,323 L 533,324 L 534,325 L 540,325 L 543,322 L 543,321 L 546,318 L 546,317 L 547,316 L 547,315 L 548,314 L 548,313 L 549,312 L 549,311 L 550,310 L 550,309 L 551,308 L 551,307 L 553,305 L 553,303 L 554,302 L 554,301 L 556,299 L 556,298 L 559,295 L 559,294 L 556,294 L 555,293 L 554,294 L 551,294 L 552,295 L 553,295 L 554,296 L 554,297 L 553,298 L 553,301 L 552,302 L 552,303 L 551,304 L 551,305 L 550,306 L 550,307 L 547,310 L 546,309 L 546,308 L 543,305 L 543,303 L 541,301 L 541,300 L 540,299 L 540,298 L 539,297 L 539,296 L 541,294 L 537,294 Z" fill="#22C55E" stroke="none" />
        <path d="M 432,293 L 431,294 L 429,294 L 428,295 L 427,295 L 425,297 L 424,297 L 422,299 L 422,300 L 421,301 L 421,302 L 420,303 L 420,304 L 419,305 L 419,313 L 420,314 L 420,318 L 424,322 L 424,323 L 425,323 L 426,324 L 429,324 L 430,325 L 440,325 L 441,324 L 443,324 L 444,323 L 445,323 L 446,322 L 446,321 L 447,320 L 446,320 L 445,321 L 444,321 L 443,322 L 442,322 L 441,323 L 433,323 L 428,318 L 428,316 L 427,315 L 427,304 L 428,303 L 428,301 L 433,296 L 434,296 L 435,295 L 440,295 L 442,297 L 443,297 L 446,300 L 446,301 L 447,302 L 447,303 L 448,302 L 448,295 L 447,294 L 446,294 L 445,295 L 442,295 L 441,294 L 439,294 L 438,293 Z" fill="#22C55E" stroke="none" />
        <path d="M 394,293 L 393,294 L 389,294 L 390,295 L 391,295 L 392,296 L 392,299 L 391,300 L 391,301 L 389,303 L 389,304 L 388,305 L 388,306 L 386,308 L 386,309 L 384,311 L 384,312 L 382,314 L 381,313 L 381,304 L 382,303 L 381,302 L 381,298 L 384,295 L 385,296 L 385,294 L 371,294 L 372,295 L 372,296 L 374,298 L 374,320 L 373,321 L 372,321 L 373,321 L 374,322 L 372,324 L 373,325 L 382,325 L 383,324 L 382,323 L 382,319 L 383,318 L 383,316 L 386,313 L 386,312 L 387,311 L 387,310 L 389,308 L 389,307 L 391,305 L 392,306 L 392,323 L 391,324 L 392,325 L 399,325 L 400,324 L 401,324 L 400,323 L 400,320 L 399,319 L 399,300 L 400,299 L 400,296 L 402,294 L 403,294 L 395,294 Z" fill="#22C55E" stroke="none" />
        <path d="M 360,293 L 359,294 L 352,294 L 353,295 L 354,295 L 355,296 L 355,297 L 356,298 L 356,321 L 355,322 L 355,323 L 354,324 L 354,325 L 357,325 L 358,326 L 359,325 L 365,325 L 365,324 L 364,323 L 364,322 L 363,321 L 363,298 L 364,297 L 364,296 L 366,294 L 367,294 L 361,294 Z" fill="#22C55E" stroke="none" />
        <path d="M 334,293 L 333,294 L 325,294 L 327,296 L 327,297 L 328,298 L 328,321 L 327,322 L 327,323 L 326,324 L 327,324 L 328,325 L 345,325 L 346,324 L 347,324 L 348,323 L 349,323 L 351,321 L 351,319 L 352,318 L 352,315 L 351,314 L 351,312 L 349,310 L 348,310 L 347,309 L 346,309 L 345,308 L 336,308 L 335,307 L 335,296 L 336,295 L 336,294 L 335,294 Z" fill="#22C55E" stroke="none" />
        <path d="M 380,284 L 379,285 L 378,285 L 378,288 L 379,289 L 380,289 L 381,290 L 394,290 L 395,289 L 395,288 L 396,287 L 396,286 L 394,284 L 393,284 L 392,285 L 391,285 L 390,286 L 390,287 L 388,289 L 387,288 L 386,289 L 385,288 L 384,288 L 383,287 L 383,286 L 381,284 Z" fill="#22C55E" stroke="none" />
      </svg>
    </div>
  );
  // Fetch all flowers for autocomplete
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        console.log("Fetching flowers from API...");
        const res = await fetch(`${API_URL}/flowers`, {
          credentials: "include",
        });
        if (res.ok) {
          const response = await res.json();
          console.log("Received flowers data:", response);
          setFlowers(response.flowers || []);
        } else {
          console.error("Failed to fetch flowers:", res.status, res.statusText);
        }
      } catch (err) {
        console.error("Error fetching flowers:", err);
      }
    };
    fetchFlowers();
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    console.log("Filtering with input:", inputValue);
    console.log("Current flowers:", flowers);

    if (inputValue.trim() === "") {
      console.log("Input is empty, clearing suggestions");
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    } else if (Array.isArray(flowers)) {
      console.log("Filtering", flowers.length, "flowers");
      const filtered = flowers.filter((flower) => {
        const matches = flower?.name
          ?.toLowerCase()
          .includes(inputValue.toLowerCase());
        console.log("Checking flower:", flower?.name, "matches:", matches);
        return matches;
      });
      console.log("Filtered results:", filtered);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      console.log("Flowers is not an array:", flowers);
    }
  }, [inputValue, flowers]);

  // Hide suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchFocus = () => {
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearch = () => {
    setSearchTerm(inputValue);
    setShowSuggestions(false);
    setShowMobileSearch(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const navigate = useNavigate();

  const handleSuggestionClick = (flower: Flower) => {
    setInputValue(flower.name);
    setSearchTerm(flower.name);
    setShowSuggestions(false);
    setShowMobileSearch(false);
    navigate(`/flowers/${flower.id}`);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowMobileSearch(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    setShowMobileMenu(false);
  };

  return (
    <header className="sticky top-0 bg-[#004F44] z-50 shadow-lg">
      {/* Main header bar */}
      <div className="pt-4 pb-4 md:pt-6 md:pb-6">
        <div className="mycon">
          {/* Desktop layout */}
          <div className="hidden md:flex justify-between items-center">
            <Link to={"/"} className="flex-shrink-0">
              <MainLogo isMobile={false} />
            </Link>

            <div className="flex gap-x-4 items-center">
              {/* Desktop Search */}
              <div className="flex flex-col relative">
                <div className="flex justify-between gap-2 items-center border border-white rounded-lg px-4 py-2 bg-[#004F44] h-12">
                  <IoSearchSharp className="text-2xl text-white flex-shrink-0" />
                  <input
                    type="search"
                    placeholder="Qidirish..."
                    className="text-xl border-none w-[300px] appearance-none focus:outline-none text-white bg-transparent h-full px-2"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleSearchFocus}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                  />
                  <button
                    className="px-4 py-1 bg-white text-[#004F44] rounded hover:bg-gray-200 transition-colors font-medium flex-shrink-0"
                    onClick={handleSearch}
                    aria-label="Qidirish"
                  >
                    Qidirish
                  </button>
                </div>
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                  >
                    {filteredSuggestions.map((flower) => (
                      <div
                        key={flower.id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black"
                        onClick={() => handleSuggestionClick(flower)}
                      >
                        {flower.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Navigation Icons */}
              <Link
                to="/cart"
                className="p-3 border border-white rounded-lg relative hover:cursor-pointer hover:bg-[#00695C] transition-all group"
                title="Savat"
              >
                <FaCartShopping className="text-white group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              <Link
                to="/admin"
                className="p-3 border border-white rounded-lg hover:cursor-pointer hover:bg-[#00695C] transition-all group"
                title="Admin Panel"
              >
                <FaUserShield className="text-white group-hover:scale-110 transition-transform text-lg" />
              </Link>

              <a
                href="tel:+998990974203"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-medium transition-colors group"
              >
                <FaPhone className="group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline">+998 99 097 42 03</span>
                <span className="lg:hidden">Call</span>
              </a>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden">
            <div className="flex justify-between items-center">
              <Link to={"/"} className="flex-shrink-0">
                <MainLogo isMobile={true} />
              </Link>

              <div className="flex items-center gap-2">
                {/* Mobile Search Button */}
                <button
                  onClick={toggleMobileSearch}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Search"
                >
                  <IoSearchSharp className="text-xl" />
                </button>

                {/* Mobile Cart with badge */}
                <Link
                  to="/cart"
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors relative"
                  title="Savat"
                >
                  <FaCartShopping className="text-xl" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Menu"
                >
                  {showMobileMenu ? (
                    <FaTimes className="text-xl" />
                  ) : (
                    <FaBars className="text-xl" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden bg-[#004F44] border-t border-white/20 px-4 pb-4">
          <div className="flex flex-col relative">
            <div className="flex gap-2 items-center border border-white rounded-lg px-3 py-2 bg-[#004F44]">
              <IoSearchSharp className="text-xl text-white flex-shrink-0" />
              <input
                type="search"
                placeholder="Qidirish..."
                className="text-lg border-none flex-1 appearance-none focus:outline-none text-white bg-transparent py-1"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleSearchFocus}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              <button
                className="px-3 py-1 bg-white text-[#004F44] rounded hover:bg-gray-200 transition-colors font-medium text-sm flex-shrink-0"
                onClick={handleSearch}
                aria-label="Qidirish"
              >
                Qidirish
              </button>
            </div>
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-48 overflow-y-auto"
              >
                {filteredSuggestions.map((flower) => (
                  <div
                    key={flower.id}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-black border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(flower)}
                  >
                    {flower.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-[#004F44] border-t border-white/20">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/admin"
              className="flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              <FaUserShield className="text-lg" />
              <span>Admin Panel</span>
            </Link>

            <a
              href="tel:+998990974203"
              className="flex items-center gap-3 p-3 text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              <FaPhone className="text-lg" />
              <span>+998 99 097 42 03</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
