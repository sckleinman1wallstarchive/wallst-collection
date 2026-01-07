import { useState } from 'react';
import { InventoryItem } from '@/types/inventory';

const initialInventory: InventoryItem[] = [
  { id: '1', name: 'CDG Staff Bomber', brand: 'Comme des Garçons', category: 'outerwear', size: 'XL', acquisitionCost: 200, askingPrice: 250, lowestAcceptablePrice: 188, status: 'listed', daysHeld: 0, platform: 'grailed', sourcePlatform: 'Grailed', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '2', name: 'CDG Logo Button Up', brand: 'Comme des Garçons', category: 'top', acquisitionCost: 100, askingPrice: 120, lowestAcceptablePrice: 90, status: 'listed', daysHeld: 0, platform: 'depop', sourcePlatform: 'Depop', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '3', name: 'Stone Island Denim Jacket', brand: 'Stone Island', category: 'outerwear', acquisitionCost: 90, askingPrice: 72, lowestAcceptablePrice: 68, status: 'listed', daysHeld: 0, platform: 'grailed', sourcePlatform: 'Grailed', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '4', name: 'Stone Island Navy/Black Zip Up', brand: 'Stone Island', category: 'outerwear', acquisitionCost: 80, askingPrice: 74, lowestAcceptablePrice: 60, status: 'listed', daysHeld: 0, platform: 'grailed', sourcePlatform: 'Grailed', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '5', name: 'Helmut Lang Zip Up Gray', brand: 'Helmut Lang', category: 'outerwear', acquisitionCost: 30, askingPrice: 72, lowestAcceptablePrice: 54, status: 'listed', daysHeld: 0, platform: 'grailed', sourcePlatform: 'Grailed', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '6', name: 'Undercover Angel Crewneck', brand: 'Undercover', category: 'top', acquisitionCost: 95, askingPrice: 130, lowestAcceptablePrice: 98, status: 'listed', daysHeld: 0, platform: 'instagram', sourcePlatform: 'Instagram', owner: 'Spencer', ownerSplit: '0/100', notes: '', dateAdded: '' },
  { id: '7', name: 'Neighborhood Squad Bomber', brand: 'Neighborhood', category: 'outerwear', acquisitionCost: 95, askingPrice: 150, lowestAcceptablePrice: 113, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Spencer', ownerSplit: '0/100', notes: '', dateAdded: '' },
  { id: '8', name: 'Yohji Spellout Long Sleeve', brand: 'Yohji Yamamoto', category: 'top', acquisitionCost: 18, askingPrice: 35, lowestAcceptablePrice: 26, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '9', name: 'Junya Watanabe Pleat Canvas Shorts', brand: 'Junya Watanabe', category: 'pants', acquisitionCost: 40, askingPrice: 50, lowestAcceptablePrice: 38, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '10', name: 'Saint Laurent Button Up Black', brand: 'Saint Laurent', category: 'top', acquisitionCost: 20, askingPrice: 36, lowestAcceptablePrice: 27, status: 'listed', daysHeld: 0, platform: 'depop', sourcePlatform: 'Depop', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '11', name: 'Undercover Drinking Man U Crew', brand: 'Undercover', category: 'top', acquisitionCost: 70, askingPrice: 130, lowestAcceptablePrice: 98, status: 'listed', daysHeld: 0, platform: 'grailed', sourcePlatform: 'Grailed', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '12', name: 'Junya Watanabe Deck Jacket', brand: 'Junya Watanabe', category: 'outerwear', acquisitionCost: 100, askingPrice: 250, lowestAcceptablePrice: 188, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Spencer', ownerSplit: '0/100', notes: '', dateAdded: '' },
  { id: '13', name: 'RL Denim & Supply Hoodie Navy', brand: 'Ralph Lauren', category: 'top', acquisitionCost: 30, askingPrice: 86, lowestAcceptablePrice: 65, status: 'listed', daysHeld: 0, platform: 'depop', sourcePlatform: 'Depop', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '14', name: 'Cindy Sherman x Undercover Crewneck', brand: 'Undercover', category: 'top', acquisitionCost: 130, askingPrice: 250, lowestAcceptablePrice: 188, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '15', name: 'Yohji Y3 Tech Hoodie Cream', brand: 'Y-3', category: 'top', acquisitionCost: 75, askingPrice: 59, lowestAcceptablePrice: 44, status: 'listed', daysHeld: 0, platform: 'grailed', sourcePlatform: 'Grailed', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '16', name: 'Prada Work Boots', brand: 'Prada', category: 'footwear', acquisitionCost: 180, askingPrice: 200, lowestAcceptablePrice: 150, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Spencer', ownerSplit: '0/100', notes: '', dateAdded: '' },
  { id: '17', name: 'Maison Margiela Boxing Shoes', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 195, askingPrice: 600, lowestAcceptablePrice: 450, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '18', name: 'Maison Margiela Afterhood', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 160, askingPrice: 240, lowestAcceptablePrice: 180, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '19', name: 'Maison Margiela Sherman High Tops', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 275, askingPrice: 475, lowestAcceptablePrice: 356, status: 'listed', daysHeld: 0, platform: 'instagram', sourcePlatform: 'Instagram', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '20', name: 'CDG White Sneakers', brand: 'Comme des Garçons', category: 'footwear', acquisitionCost: 84, askingPrice: 253, lowestAcceptablePrice: 190, salePrice: 253, status: 'sold', daysHeld: 0, platform: 'trade', sourcePlatform: 'Trade + Cash', owner: 'Parker', ownerSplit: '100/0', notes: 'Sold to Logan for fake Raf pants and 100 cash', dateAdded: '', dateSold: '2025-10-12' },
  { id: '21', name: 'Helmut Lang Cashmere Zip Up Navy', brand: 'Helmut Lang', category: 'outerwear', acquisitionCost: 54, askingPrice: 140, lowestAcceptablePrice: 105, status: 'listed', daysHeld: 0, platform: 'instagram', sourcePlatform: 'Instagram', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '22', name: 'Prada Monte Carlo Shoe white', brand: 'Prada', category: 'footwear', acquisitionCost: 136, askingPrice: 220, lowestAcceptablePrice: 165, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '23', name: 'Prada Car Shoes Black', brand: 'Prada', category: 'footwear', acquisitionCost: 134, askingPrice: 150, lowestAcceptablePrice: 113, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '24', name: 'Prada Car Shoes Beige', brand: 'Prada', category: 'footwear', acquisitionCost: 100, askingPrice: 134, lowestAcceptablePrice: 101, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '25', name: 'CDG Wool Jacket Black', brand: 'Comme des Garçons', category: 'outerwear', acquisitionCost: 141, askingPrice: 225, lowestAcceptablePrice: 169, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '26', name: 'CDG Homme "Homme" Tee', brand: 'Comme des Garçons', category: 'top', acquisitionCost: 43, askingPrice: 50, lowestAcceptablePrice: 38, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '27', name: 'Undercover 2016 Blue Knit', brand: 'Undercover', category: 'top', acquisitionCost: 94, askingPrice: 0, lowestAcceptablePrice: 0, status: 'traded', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: 'Traded', dateAdded: '' },
  { id: '28', name: 'Dior Homme B18 Sneakers', brand: 'Dior Homme', category: 'footwear', acquisitionCost: 88, askingPrice: 250, lowestAcceptablePrice: 188, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '29', name: 'Undercover Monolith Shirt (Slaves)', brand: 'Undercover', category: 'top', acquisitionCost: 44, askingPrice: 60, lowestAcceptablePrice: 45, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '30', name: 'Jil Sander Shirt', brand: 'Jil Sander', category: 'top', acquisitionCost: 33, askingPrice: 42, lowestAcceptablePrice: 32, status: 'listed', daysHeld: 0, platform: 'depop', sourcePlatform: 'Depop', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '31', name: 'CDG Shirt Black T Shirt', brand: 'Comme des Garçons', category: 'top', acquisitionCost: 23, askingPrice: 45, lowestAcceptablePrice: 34, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '32', name: 'Margiela Distressed T (missing tag)', brand: 'Maison Margiela', category: 'top', acquisitionCost: 36, askingPrice: 75, lowestAcceptablePrice: 56, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '33', name: 'Buckleback Kapital Pants', brand: 'Kapital', category: 'pants', acquisitionCost: 170, askingPrice: 156, lowestAcceptablePrice: 117, status: 'listed', daysHeld: 0, platform: 'grailed', sourcePlatform: 'Grailed', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '34', name: 'Yohji Yamamoto Pour Homme Type 2', brand: 'Yohji Yamamoto', category: 'pants', acquisitionCost: 318, askingPrice: 400, lowestAcceptablePrice: 300, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Spencer', ownerSplit: '0/100', notes: '', dateAdded: '' },
  { id: '35', name: 'Prada Military Parka', brand: 'Prada', category: 'outerwear', acquisitionCost: 225, askingPrice: 450, lowestAcceptablePrice: 338, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '36', name: 'Margiela Contrast Stitch Shirt navy no label', brand: 'Maison Margiela', category: 'top', acquisitionCost: 40, askingPrice: 80, lowestAcceptablePrice: 60, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '37', name: 'Margiela Gray radio Graphic Shirt', brand: 'Maison Margiela', category: 'top', acquisitionCost: 46, askingPrice: 125, lowestAcceptablePrice: 94, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '38', name: 'Kapital Reverse T Shirt', brand: 'Kapital', category: 'top', acquisitionCost: 60, askingPrice: 150, lowestAcceptablePrice: 113, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '39', name: 'Kapital Indigo Long Sleeve', brand: 'Kapital', category: 'top', acquisitionCost: 67, askingPrice: 83, lowestAcceptablePrice: 62, status: 'listed', daysHeld: 0, platform: 'depop', sourcePlatform: 'Depop', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '40', name: 'Kapital Kountry Skeleton Shirt', brand: 'Kapital', category: 'top', acquisitionCost: 75, askingPrice: 103, lowestAcceptablePrice: 77, status: 'listed', daysHeld: 0, platform: 'depop', sourcePlatform: 'Depop', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '41', name: 'Marni Clogs', brand: 'Marni', category: 'footwear', acquisitionCost: 200, askingPrice: 240, lowestAcceptablePrice: 180, status: 'listed', daysHeld: 0, platform: 'grailed', sourcePlatform: 'Grailed', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '42', name: 'Chrome Hearts American Flag Shirt', brand: 'Chrome Hearts', category: 'top', acquisitionCost: 300, askingPrice: 475, lowestAcceptablePrice: 356, status: 'listed', daysHeld: 0, platform: 'instagram', sourcePlatform: 'Instagram', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '43', name: 'Number 9 Mickey T Shirt', brand: 'Number (N)ine', category: 'top', acquisitionCost: 55, askingPrice: 86, lowestAcceptablePrice: 65, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '44', name: 'Kapital Nouvelle Pants Beige', brand: 'Kapital', category: 'pants', acquisitionCost: 250, askingPrice: 250, lowestAcceptablePrice: 188, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '45', name: 'Chrome Hearts Celtic Roller Belt', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 0, askingPrice: 600, lowestAcceptablePrice: 450, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '46', name: 'Kapital Nouvelle Pants Navy', brand: 'Kapital', category: 'pants', acquisitionCost: 250, askingPrice: 250, lowestAcceptablePrice: 188, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '47', name: 'Maison Margiela H&M High Tops', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 199, askingPrice: 315, lowestAcceptablePrice: 236, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '48', name: 'Maison Margiela Casual White Sneakers', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 100, askingPrice: 151, lowestAcceptablePrice: 113, status: 'listed', daysHeld: 0, platform: 'grailed', sourcePlatform: 'Grailed', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '49', name: 'CDG Leather Sleeve Varsity', brand: 'Comme des Garçons', category: 'outerwear', acquisitionCost: 225, askingPrice: 375, lowestAcceptablePrice: 281, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '50', name: 'Saint Laurent Tiger Belt', brand: 'Saint Laurent', category: 'accessory', acquisitionCost: 125, askingPrice: 250, lowestAcceptablePrice: 188, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '51', name: 'Maison Margiela Navy Cashmere Knit', brand: 'Maison Margiela', category: 'top', acquisitionCost: 140, askingPrice: 215, lowestAcceptablePrice: 161, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '52', name: 'Maison Margiela Contrast Tee Navy', brand: 'Maison Margiela', category: 'top', acquisitionCost: 50, askingPrice: 150, lowestAcceptablePrice: 113, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '53', name: 'Maison Margiela Contrast Tee Black', brand: 'Maison Margiela', category: 'top', acquisitionCost: 38, askingPrice: 150, lowestAcceptablePrice: 113, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '54', name: 'Maison Margiela Strap Up Gold Sole', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 186, askingPrice: 370, lowestAcceptablePrice: 278, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '55', name: 'Maison Margiela Navy Boxing Shoes', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 156, askingPrice: 350, lowestAcceptablePrice: 263, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '56', name: 'Prada Cashmere Striped Knit Navy', brand: 'Prada', category: 'top', acquisitionCost: 38, askingPrice: 87, lowestAcceptablePrice: 65, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '57', name: 'Maison Margiela Gray Denim', brand: 'Maison Margiela', category: 'pants', acquisitionCost: 227, askingPrice: 350, lowestAcceptablePrice: 263, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '58', name: 'Raf Simons 08-09 Knit Sweater', brand: 'Raf Simons', category: 'top', acquisitionCost: 136, askingPrice: 252, lowestAcceptablePrice: 189, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '59', name: 'Chrome Hearts Harris Teeter Pendant', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 404, askingPrice: 750, lowestAcceptablePrice: 563, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '60', name: 'Margiela Blank Beige Shirt', brand: 'Maison Margiela', category: 'top', acquisitionCost: 35, askingPrice: 80, lowestAcceptablePrice: 60, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '61', name: 'Rick Owens Gimp Hoodie', brand: 'Rick Owens', category: 'top', acquisitionCost: 224, askingPrice: 260, lowestAcceptablePrice: 195, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '62', name: 'Maison Margiela Driver Knit', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 240, askingPrice: 280, lowestAcceptablePrice: 210, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '63', name: 'Chrome Hearts Filigree Pull Pendant', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 642, askingPrice: 0, lowestAcceptablePrice: 0, status: 'archive-hold', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '64', name: 'Rick Owens Oyster Windbreaker Hoodie', brand: 'Rick Owens', category: 'outerwear', acquisitionCost: 168, askingPrice: 260, lowestAcceptablePrice: 195, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '65', name: 'Chrome Hearts Leather/Hardware Longsleeve', brand: 'Chrome Hearts', category: 'top', acquisitionCost: 181, askingPrice: 400, lowestAcceptablePrice: 300, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '66', name: 'CDG Homme Split Logo', brand: 'Comme des Garçons', category: 'top', acquisitionCost: 103, askingPrice: 200, lowestAcceptablePrice: 150, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '67', name: 'CDG Navy Wool Coat Blazer', brand: 'Comme des Garçons', category: 'outerwear', acquisitionCost: 80, askingPrice: 103, lowestAcceptablePrice: 77, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '68', name: 'Maison Margiela White Sweater Suede Elbow', brand: 'Maison Margiela', category: 'top', acquisitionCost: 54, askingPrice: 140, lowestAcceptablePrice: 105, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '69', name: 'Chrome Hearts Lanyard Lobster Clasp', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 642, askingPrice: 1200, lowestAcceptablePrice: 900, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '70', name: 'Saint Laurent Sunglasses', brand: 'Saint Laurent', category: 'accessory', acquisitionCost: 0, askingPrice: 150, lowestAcceptablePrice: 113, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '71', name: 'Maison Margiela GATS Black gum sole', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 0, askingPrice: 360, lowestAcceptablePrice: 270, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '73', name: 'Maison Margiela Moto High Tops', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 353, askingPrice: 550, lowestAcceptablePrice: 413, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '74', name: 'Raf Simons Doll T Shirt', brand: 'Raf Simons', category: 'top', acquisitionCost: 29, askingPrice: 200, lowestAcceptablePrice: 150, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '75', name: 'Chrome Hearts Bifold Wallet', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 0, askingPrice: 380, lowestAcceptablePrice: 285, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '76', name: 'Chrome Hearts Trucker Hat', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 0, askingPrice: 212, lowestAcceptablePrice: 159, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '77', name: 'Maison Margiela Gray GATS', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 330, askingPrice: 450, lowestAcceptablePrice: 338, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '78', name: 'Maison Margiela High Tops Patent Leather', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 235, askingPrice: 325, lowestAcceptablePrice: 244, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '79', name: 'Chrome Hearts Double Cross Pendant', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 803, askingPrice: 1200, lowestAcceptablePrice: 900, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '80', name: 'Rick Owens Level T Shirt', brand: 'Rick Owens', category: 'top', acquisitionCost: 68, askingPrice: 115, lowestAcceptablePrice: 86, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '81', name: 'Maison Margiela Shine Patchwork T Shirt', brand: 'Maison Margiela', category: 'top', acquisitionCost: 65, askingPrice: 200, lowestAcceptablePrice: 150, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '82', name: 'Chrome Hearts Roll Chain', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 220, askingPrice: 440, lowestAcceptablePrice: 330, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '83', name: 'Maison Margiela Olive Canvas GATs', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 200, askingPrice: 400, lowestAcceptablePrice: 300, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '84', name: 'Maison Margiela White Paint GATs', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 160, askingPrice: 375, lowestAcceptablePrice: 281, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '85', name: 'Kapital Cream Sourel Pants', brand: 'Kapital', category: 'pants', acquisitionCost: 110, askingPrice: 200, lowestAcceptablePrice: 150, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '87', name: 'Chrome Hearts Feather Pendant', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 330, askingPrice: 800, lowestAcceptablePrice: 600, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '88', name: 'Maison Margiela Strap Up Navy High Tops', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 185, askingPrice: 325, lowestAcceptablePrice: 244, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '89', name: 'Item 89', brand: 'Unknown', category: 'other', acquisitionCost: 0, askingPrice: 350, lowestAcceptablePrice: 263, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '90', name: 'Rick owens oyster shirt hoodie long', brand: 'Rick Owens', category: 'top', acquisitionCost: 50, askingPrice: 150, lowestAcceptablePrice: 113, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '91', name: 'Maison Margiela Bianchetto GATs', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 289, askingPrice: 200, lowestAcceptablePrice: 150, status: 'archive-hold', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: 'Fake', dateAdded: '' },
  { id: '92', name: 'Maison Margiela Fat Tongue High Tops', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 110, askingPrice: 250, lowestAcceptablePrice: 188, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '93', name: 'Maison Margiela 5 Zip Jacket', brand: 'Maison Margiela', category: 'outerwear', acquisitionCost: 422, askingPrice: 660, lowestAcceptablePrice: 495, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '94', name: 'Maison margiela V Neck T Shirt black', brand: 'Maison Margiela', category: 'top', acquisitionCost: 40, askingPrice: 115, lowestAcceptablePrice: 86, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '95', name: 'Chrome Hearts Baby Fat Pendant', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 258, askingPrice: 650, lowestAcceptablePrice: 488, status: 'in-closet', daysHeld: 0, platform: 'vinted', sourcePlatform: 'Vinted/Depop', owner: 'Spencer', ownerSplit: '0/100', notes: '', dateAdded: '' },
  { id: '96', name: 'Chrome Hearts Rolling Stones Pendant', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 180, askingPrice: 0, lowestAcceptablePrice: 0, status: 'scammed', daysHeld: 0, platform: 'none', owner: 'Spencer', ownerSplit: '0/100', notes: 'Scammed', dateAdded: '' },
  { id: '98', name: 'Maison Margiela GATs Elastic Strap', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 245, askingPrice: 350, lowestAcceptablePrice: 263, status: 'in-closet', daysHeld: 0, platform: 'grailed', sourcePlatform: 'Grailed', owner: 'Spencer', ownerSplit: '0/100', notes: '', dateAdded: '' },
  { id: '99', name: 'Maison Margiela GATs Blacked Out', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 186, askingPrice: 350, lowestAcceptablePrice: 263, status: 'in-closet', daysHeld: 0, platform: 'vinted', sourcePlatform: 'Vinted', owner: 'Spencer', ownerSplit: '0/100', notes: '', dateAdded: '' },
  { id: '100', name: 'Maison Margiela Cashmere Sweater', brand: 'Maison Margiela', category: 'top', acquisitionCost: 86, askingPrice: 200, lowestAcceptablePrice: 150, status: 'in-closet', daysHeld: 0, platform: 'ebay', sourcePlatform: 'Ebay', owner: 'Spencer', ownerSplit: '0/100', notes: '', dateAdded: '' },
  { id: '101', name: 'Chrome Hearts Sunglasses', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 231, askingPrice: 0, lowestAcceptablePrice: 0, status: 'scammed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: 'Scammed', dateAdded: '' },
  { id: '102', name: 'Chrome Hearts fuck you oval motif Paper Chain 1', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 450, askingPrice: 1800, lowestAcceptablePrice: 1350, status: 'in-closet', daysHeld: 0, platform: 'mercari', sourcePlatform: 'Mercari', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '103', name: 'Chrome Hearts FUCK YOU Medallion', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 244, askingPrice: 550, lowestAcceptablePrice: 413, status: 'in-closet', daysHeld: 0, platform: 'ebay', sourcePlatform: 'Ebay', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '104', name: 'Refunded Item', brand: 'Unknown', category: 'other', acquisitionCost: 0, askingPrice: 0, lowestAcceptablePrice: 0, status: 'refunded', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: 'Refunded', dateAdded: '' },
  { id: '105', name: 'Chrome hearts silver cross pendant w/ bale', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 450, askingPrice: 1400, lowestAcceptablePrice: 1050, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '106', name: 'Maison Margiela Quarter Zip Grey', brand: 'Maison Margiela', category: 'top', acquisitionCost: 153, askingPrice: 325, lowestAcceptablePrice: 244, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '107', name: 'Chrome Hearts Long Sleeve White Scroll', brand: 'Chrome Hearts', category: 'top', acquisitionCost: 220, askingPrice: 0, lowestAcceptablePrice: 0, status: 'refunded', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: 'Refunded', dateAdded: '' },
  { id: '108', name: 'Maison margiela grey graphic t', brand: 'Maison Margiela', category: 'top', acquisitionCost: 38, askingPrice: 100, lowestAcceptablePrice: 75, status: 'in-closet', daysHeld: 0, platform: 'ebay', sourcePlatform: 'Ebay', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '110', name: 'Maison margiela deanna driver knit white', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 95, askingPrice: 650, lowestAcceptablePrice: 488, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '111', name: 'Maison margiela future black leather sz 45', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 312, askingPrice: 0, lowestAcceptablePrice: 0, status: 'refunded', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: 'Refunding', dateAdded: '' },
  { id: '112', name: 'Maison margiela gats all black size 10', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 150, askingPrice: 350, lowestAcceptablePrice: 263, status: 'refunded', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: 'Refunding', dateAdded: '' },
  { id: '113', name: 'Maison Margiela deanna driver Driver Knit black', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 403, askingPrice: 650, lowestAcceptablePrice: 488, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '114', name: 'Rick owens pearl long sleeve', brand: 'Rick Owens', category: 'top', acquisitionCost: 48, askingPrice: 95, lowestAcceptablePrice: 71, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '116', name: 'Rick owens larry t black', brand: 'Rick Owens', category: 'top', acquisitionCost: 61, askingPrice: 115, lowestAcceptablePrice: 86, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '117', name: 'Vintage Number nine belt black', brand: 'Number (N)ine', category: 'accessory', acquisitionCost: 76, askingPrice: 150, lowestAcceptablePrice: 113, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '118', name: 'Vintage Number Nine belt brown', brand: 'Number (N)ine', category: 'accessory', acquisitionCost: 76, askingPrice: 150, lowestAcceptablePrice: 113, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '119', name: 'Maison margiela baggy sweatpants grey', brand: 'Maison Margiela', category: 'pants', acquisitionCost: 103, askingPrice: 225, lowestAcceptablePrice: 169, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '120', name: 'Maison margiela hidden lace hightops gray sz 42', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 266, askingPrice: 300, lowestAcceptablePrice: 225, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '121', name: 'Maison margiela paint splatter mid top sz 41', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 195, askingPrice: 350, lowestAcceptablePrice: 263, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '122', name: 'Chrome hearts extra wide crossball leather bracelet', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 385, askingPrice: 550, lowestAcceptablePrice: 413, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '123', name: 'Chrome hearts white leather gunslinger bracelet', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 385, askingPrice: 550, lowestAcceptablePrice: 413, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '124', name: 'Chrome hearts pink and black trucker hat', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 160, askingPrice: 215, lowestAcceptablePrice: 161, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '125', name: 'Rick owens fogachine black knit hoodie', brand: 'Rick Owens', category: 'top', acquisitionCost: 239, askingPrice: 325, lowestAcceptablePrice: 244, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '126', name: 'Maison margiela patchwork Gats', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 186, askingPrice: 350, lowestAcceptablePrice: 263, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '127', name: 'Chrome hearts silk bracelet', brand: 'Chrome Hearts', category: 'accessory', acquisitionCost: 219, askingPrice: 325, lowestAcceptablePrice: 244, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '128', name: 'Maison margiela gray patchwork zip up', brand: 'Maison Margiela', category: 'top', acquisitionCost: 105, askingPrice: 200, lowestAcceptablePrice: 150, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '129', name: 'Rick owens drop crotch pants in dust', brand: 'Rick Owens', category: 'pants', acquisitionCost: 66, askingPrice: 175, lowestAcceptablePrice: 131, status: 'in-closet', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
  { id: '130', name: 'Maison margiela GATS brown', brand: 'Maison Margiela', category: 'footwear', acquisitionCost: 87, askingPrice: 350, lowestAcceptablePrice: 263, status: 'listed', daysHeld: 0, platform: 'none', owner: 'Parker', ownerSplit: '100/0', notes: '', dateAdded: '' },
];

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  const addItem = (item: Omit<InventoryItem, 'id' | 'daysHeld'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      daysHeld: 0,
    };
    setInventory((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const markAsSold = (id: string, salePrice: number, soldTo?: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'sold' as const,
              salePrice,
              dateSold: new Date().toISOString().split('T')[0],
              soldTo,
            }
          : item
      )
    );
  };

  const getActiveItems = () => inventory.filter((i) => 
    i.status !== 'sold' && i.status !== 'scammed' && i.status !== 'refunded' && i.status !== 'traded'
  );
  const getSoldItems = () => inventory.filter((i) => i.status === 'sold');

  const getFinancialSummary = () => {
    const sold = getSoldItems();
    const active = getActiveItems();
    const scammed = inventory.filter((i) => i.status === 'scammed');

    const totalRevenue = sold.reduce((sum, i) => sum + (i.salePrice || 0), 0);
    const totalCostOfSold = sold.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const totalProfit = totalRevenue - totalCostOfSold;
    const activeInventoryCost = active.reduce((sum, i) => sum + i.acquisitionCost, 0);
    const potentialRevenue = active.reduce((sum, i) => sum + i.askingPrice, 0);
    const minimumRevenue = active.reduce((sum, i) => sum + i.lowestAcceptablePrice, 0);
    const lostToScams = scammed.reduce((sum, i) => sum + i.acquisitionCost, 0);

    return {
      totalRevenue,
      totalCostOfSold,
      totalProfit,
      activeInventoryCost,
      potentialRevenue,
      minimumRevenue,
      itemsSold: sold.length,
      activeItems: active.length,
      lostToScams,
      avgMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0',
    };
  };

  return {
    inventory,
    addItem,
    updateItem,
    deleteItem,
    markAsSold,
    getActiveItems,
    getSoldItems,
    getFinancialSummary,
  };
}
