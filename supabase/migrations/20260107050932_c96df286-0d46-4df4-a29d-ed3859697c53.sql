-- Insert all inventory items from CSV data
INSERT INTO public.inventory_items (name, brand, size, acquisition_cost, asking_price, sale_price, platform_sold, date_sold, source_platform, owner, owner_split, status, category, notes) VALUES
-- Row 2: CDG Staff Bomber - SOLD
('CDG Staff Bomber', 'Comme des Garçons', 'L', 200, NULL, 250, 'grailed', '2024-09-20', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'outerwear', NULL),
-- Row 3: Stone Island Compass Hoodie - SOLD
('Stone Island Compass Hoodie', 'Stone Island', 'L', 80, NULL, 125, 'grailed', '2024-09-20', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'tops', NULL),
-- Row 4: Helmut Lang Bondage Strap Astro Pants - SOLD
('Helmut Lang Bondage Strap Astro Pants', 'Helmut Lang', '34', 150, NULL, 205, 'grailed', '2024-09-22', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'bottoms', NULL),
-- Row 5: Undercover Angel Crewneck - SOLD
('Undercover Angel Crewneck', 'Undercover', '2', 95, NULL, 130, 'grailed', '2024-09-28', 'Grailed', 'Spencer Kleinman', '0/100', 'sold', 'tops', NULL),
-- Row 6: Yohji Cropped Wool Pants - SOLD
('Yohji Cropped Wool Pants', 'Yohji Yamamoto', '2', 110, NULL, 148, 'grailed', '2024-10-04', 'Grailed', 'Spencer Kleinman', '0/100', 'sold', 'bottoms', NULL),
-- Row 7: Neighborhood Squad Bomber - LISTED
('Neighborhood Squad Bomber', 'Neighborhood', 'L', 95, 150, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 8: Y-3 Jacket - SOLD
('Y-3 Jacket', 'Y-3', 'M', 60, NULL, 85, 'grailed', '2024-10-11', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'outerwear', NULL),
-- Row 9: Stone Island Classic Zip Hoodie - SOLD
('Stone Island Classic Zip Hoodie', 'Stone Island', 'L', 80, NULL, 150, 'grailed', '2024-10-11', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'tops', NULL),
-- Row 10: Y-3 Shorts - SOLD
('Y-3 Shorts', 'Y-3', 'L', 30, NULL, 45, 'grailed', '2024-10-11', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'bottoms', NULL),
-- Row 11: Junya Watanabe x Carhartt Camo Pants - LISTED
('Junya Watanabe x Carhartt Camo Pants', 'Junya Watanabe', 'S', 180, 300, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 12: Stone Island Ghost Overshirt - LISTED
('Stone Island Ghost Overshirt', 'Stone Island', 'L', 105, 225, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 13: Maison Margiela Flares - SOLD
('Maison Margiela Flares', 'Maison Margiela', '48', 80, NULL, 136, 'grailed', '2024-10-17', 'Grailed', 'Spencer Kleinman', '0/100', 'sold', 'bottoms', NULL),
-- Row 14: Raf Simons Riot Riot Riot Crewneck - LISTED
('Raf Simons Riot Riot Riot Crewneck', 'Raf Simons', 'S', 220, 399, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 15: Helmut Lang Bondage Strap Astro Pants #2 - LISTED
('Helmut Lang Bondage Strap Astro Pants', 'Helmut Lang', '32', 160, 250, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'bottoms', NULL),
-- Row 16: Prada Combat Boots - SOLD
('Prada Combat Boots', 'Prada', '8', 230, NULL, 315, 'grailed', '2024-10-18', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'footwear', NULL),
-- Row 17: Kapital Bone Zip Hoodie - SOLD
('Kapital Bone Zip Hoodie', 'Kapital', '2', 125, NULL, 195, 'grailed', '2024-10-21', 'Grailed', 'Spencer Kleinman', '0/100', 'sold', 'tops', NULL),
-- Row 18: Undercover x Uniqlo UU Blazer - IN CLOSET
('Undercover x Uniqlo UU Blazer', 'Undercover', 'M', 10, NULL, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'in-closet', 'outerwear', NULL),
-- Row 19: Undercover by Jun Takahashi L/S - LISTED
('Undercover by Jun Takahashi L/S', 'Undercover', '2', 65, 110, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 20: Enfin Leve Cargos - SOLD
('Enfin Leve Cargos', 'Enfin Leve', 'L', 170, NULL, 250, 'grailed', '2024-10-24', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'bottoms', NULL),
-- Row 21: Kapital Kountry Camo Fleece - LISTED
('Kapital Kountry Camo Fleece', 'Kapital', '3', 180, 350, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 22: Acne Studios Forba Face Sweatshirt - LISTED
('Acne Studios Forba Face Sweatshirt', 'Acne Studios', 'L', 75, 130, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'tops', NULL),
-- Row 23: Maison Margiela German Army Trainers - SOLD
('Maison Margiela German Army Trainers', 'Maison Margiela', '43', 265, NULL, 340, 'grailed', '2024-10-30', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'footwear', NULL),
-- Row 24: Number (N)ine Eternal Youth Longsleeve - SOLD
('Number (N)ine Eternal Youth Longsleeve', 'Number (N)ine', '3', 100, NULL, 145, 'grailed', '2024-11-03', 'Grailed', 'Spencer Kleinman', '0/100', 'sold', 'tops', NULL),
-- Row 25: WTAPS Black Hoodie - LISTED
('WTAPS Black Hoodie', 'WTAPS', 'L', 60, 115, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'tops', NULL),
-- Row 26: Carhartt Camo Puffer - LISTED
('Carhartt Camo Puffer', 'Carhartt', 'M', 50, 90, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 27: Junya Watanabe x Carhartt Shirt - TRADED
('Junya Watanabe x Carhartt Shirt', 'Junya Watanabe', 'M', 95, NULL, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'traded', 'tops', 'Traded'),
-- Row 28: Rick Owens DRKSHDW Prisoner Pants - LISTED
('Rick Owens DRKSHDW Prisoner Pants', 'Rick Owens', 'M', 88, 180, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 29: Stone Island Overshirt - SOLD
('Stone Island Overshirt', 'Stone Island', 'L', 100, NULL, 195, 'grailed', '2024-11-11', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'tops', NULL),
-- Row 30: Stone Island Sweater - LISTED
('Stone Island Sweater', 'Stone Island', 'M', 58, 125, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'tops', NULL),
-- Row 31: Stone Island Ghost Overshirt White - LISTED
('Stone Island Ghost Overshirt White', 'Stone Island', 'L', 100, 220, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'tops', NULL),
-- Row 32: Burberry Button Up - LISTED
('Burberry Button Up', 'Burberry', 'M', 50, 100, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'tops', NULL),
-- Row 33: Dior Homme Jacket - LISTED
('Dior Homme Jacket', 'Dior Homme', '46', 70, 135, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 34: Issey Miyake Striped Cardigan - LISTED
('Issey Miyake Striped Cardigan', 'Issey Miyake', 'M', 55, 110, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'tops', NULL),
-- Row 35: Kenzo Striped L/S - IN CLOSET
('Kenzo Striped L/S', 'Kenzo', 'L', 20, NULL, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'in-closet', 'tops', NULL),
-- Row 36: Saint Laurent Varsity Jacket - LISTED
('Saint Laurent Varsity Jacket', 'Saint Laurent', '50', 300, 700, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 37: Takahiromiyashita The Soloist Pants - LISTED
('Takahiromiyashita The Soloist Pants', 'The Soloist', '48', 175, 275, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 38: Maison Margiela Artisinal Reconstructed Pants - LISTED
('Maison Margiela Artisinal Reconstructed Pants', 'Maison Margiela', '48', 150, 225, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 39: Maison Margiela Hopsack Trousers - LISTED
('Maison Margiela Hopsack Trousers', 'Maison Margiela', '48', 55, 110, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 40: Stone Island Taped Seams Jacket - LISTED
('Stone Island Taped Seams Jacket', 'Stone Island', 'L', 185, 400, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 41: Yohji Yamamoto Pants - LISTED
('Yohji Yamamoto Pants', 'Yohji Yamamoto', '3', 130, 230, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 42: Marni Reconstructed T-Shirt - LISTED
('Marni Reconstructed T-Shirt', 'Marni', 'M', 45, 85, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'tops', NULL),
-- Row 43: Stone Island Raso Gommato Jacket - LISTED
('Stone Island Raso Gommato Jacket', 'Stone Island', 'L', 160, 375, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 44: Stone Island Ice Jacket - LISTED
('Stone Island Ice Jacket', 'Stone Island', 'L', 165, 425, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 45: Number (N)ine Deconstructed Hoodie - LISTED
('Number (N)ine Deconstructed Hoodie', 'Number (N)ine', '3', 300, 600, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 46: Prada Padded Buckle Boots - LISTED
('Prada Padded Buckle Boots', 'Prada', '8.5', 310, 650, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'footwear', NULL),
-- Row 47: Undercover Rubber Sole Boots - SOLD
('Undercover Rubber Sole Boots', 'Undercover', '8', 280, NULL, 400, 'grailed', '2024-12-02', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'footwear', NULL),
-- Row 48: Raf Simons x Eastpak Crossbody - LISTED
('Raf Simons x Eastpak Crossbody', 'Raf Simons', 'OS', 75, 145, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'accessories', NULL),
-- Row 49: Prada Anorak - LISTED
('Prada Anorak', 'Prada', 'M', 240, 475, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 50: Undercover Shepherd Check Coat - LISTED
('Undercover Shepherd Check Coat', 'Undercover', '3', 100, 200, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 51: Undercover Soundsystem T-Shirt - LISTED
('Undercover Soundsystem T-Shirt', 'Undercover', '4', 70, 150, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 52: Yohji Yamamoto x New Era Wool Cap - LISTED
('Yohji Yamamoto x New Era Wool Cap', 'Yohji Yamamoto', '7 1/4', 50, 110, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'accessories', NULL),
-- Row 53: Haider Ackermann Pants - LISTED
('Haider Ackermann Pants', 'Haider Ackermann', 'XS', 75, 175, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 54: Stone Island Stella Jacket - LISTED
('Stone Island Stella Jacket', 'Stone Island', 'L', 320, 600, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 55: Helmut Lang Military Vest - LISTED
('Helmut Lang Military Vest', 'Helmut Lang', 'M', 160, 350, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 56: Stone Island Marina Sweater - SOLD
('Stone Island Marina Sweater', 'Stone Island', 'L', 135, NULL, 220, 'grailed', '2024-12-11', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'tops', NULL),
-- Row 57: Dries Van Noten Pants - LISTED
('Dries Van Noten Pants', 'Dries Van Noten', 'M', 65, 145, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'bottoms', NULL),
-- Row 58: Haider Ackermann Camo Pants - LISTED
('Haider Ackermann Camo Pants', 'Haider Ackermann', 'XS', 50, 110, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 59: Junya Watanabe Jacquard Sweater - LISTED
('Junya Watanabe Jacquard Sweater', 'Junya Watanabe', 'M', 115, 250, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 60: Issey Miyake Pleats Please - LISTED
('Issey Miyake Pleats Please', 'Issey Miyake', '3', 45, 100, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 61: Needles Track Pants Purple - LISTED
('Needles Track Pants Purple', 'Needles', 'M', 115, 245, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 62: Undercover But Beautiful II Pants - LISTED
('Undercover But Beautiful II Pants', 'Undercover', '2', 90, 200, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 63: Raf Simons x Eastpak Backpack - LISTED
('Raf Simons x Eastpak Backpack', 'Raf Simons', 'OS', 145, 295, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'accessories', NULL),
-- Row 64: Dior Homme Sheer Shirt - LISTED
('Dior Homme Sheer Shirt', 'Dior Homme', 'S', 45, 95, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 65: White Mountaineering Jacket - LISTED
('White Mountaineering Jacket', 'White Mountaineering', '2', 140, 325, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 66: Yohji Yamamoto Pour Homme Layered Vest - LISTED
('Yohji Yamamoto Pour Homme Layered Vest', 'Yohji Yamamoto', '2', 75, 185, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 67: Saint Laurent Leather Boots - LISTED
('Saint Laurent Leather Boots', 'Saint Laurent', '43', 295, 525, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'footwear', NULL),
-- Row 68: Margiela Painter Pants - LISTED
('Margiela Painter Pants', 'Maison Margiela', 'S', 55, 125, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 69: Stone Island Crinkle Reps Jacket - LISTED
('Stone Island Crinkle Reps Jacket', 'Stone Island', 'L', 170, 375, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 70: Prada Leather Belt - LISTED
('Prada Leather Belt', 'Prada', '32', 125, 275, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'accessories', NULL),
-- Row 71: Yohji Yamamoto Lace Up Shirt - LISTED
('Yohji Yamamoto Lace Up Shirt', 'Yohji Yamamoto', '3', 110, 245, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 72: Stone Island Shadow Project Jacket - LISTED
('Stone Island Shadow Project Jacket', 'Stone Island', 'L', 250, 525, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 73: Dries Van Noten Floral Shirt - LISTED
('Dries Van Noten Floral Shirt', 'Dries Van Noten', 'M', 85, 195, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'tops', NULL),
-- Row 74: Raf Simons Virginia Creeper Hoodie - LISTED
('Raf Simons Virginia Creeper Hoodie', 'Raf Simons', 'S', 350, 750, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 75: Undercover Scab Tee - LISTED
('Undercover Scab Tee', 'Undercover', '3', 185, 400, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 76: Bottega Veneta Card Holder - LISTED
('Bottega Veneta Card Holder', 'Bottega Veneta', 'OS', 135, 275, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'accessories', NULL),
-- Row 77: Kapital Damask Fleece - LISTED
('Kapital Damask Fleece', 'Kapital', '3', 215, 450, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 78: Helmut Lang Painter Jeans - LISTED
('Helmut Lang Painter Jeans', 'Helmut Lang', '30', 140, 300, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 79: Undercover Ethnic Rider Jacket - LISTED
('Undercover Ethnic Rider Jacket', 'Undercover', '2', 375, 800, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 80: Dior Homme Navigate Boots - LISTED
('Dior Homme Navigate Boots', 'Dior Homme', '42', 340, 700, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'footwear', NULL),
-- Row 81: Haider Ackermann Velvet Blazer - LISTED
('Haider Ackermann Velvet Blazer', 'Haider Ackermann', 'XS', 225, 475, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 82: Stone Island Nylon Metal Jacket - LISTED
('Stone Island Nylon Metal Jacket', 'Stone Island', 'L', 195, 425, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 83: Raf Simons Joy Division Tee - SOLD
('Raf Simons Joy Division Tee', 'Raf Simons', 'S', 225, NULL, 345, 'grailed', '2024-12-28', 'Grailed', 'Spencer Kleinman', '0/100', 'sold', 'tops', NULL),
-- Row 84: Guidi PL2 - LISTED
('Guidi PL2', 'Guidi', '42', 440, 825, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'footwear', NULL),
-- Row 85: Rick Owens DRKSHDW Ramones - LISTED
('Rick Owens DRKSHDW Ramones', 'Rick Owens', '42', 280, 525, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'footwear', NULL),
-- Row 86: Maison Margiela Replica Sneakers - LISTED
('Maison Margiela Replica Sneakers', 'Maison Margiela', '43', 165, 350, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'footwear', NULL),
-- Row 87: Issey Miyake Homme Plisse Pants - LISTED
('Issey Miyake Homme Plisse Pants', 'Issey Miyake', 'M', 125, 275, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 88: Number (N)ine x Marlboro Tee - LISTED
('Number (N)ine x Marlboro Tee', 'Number (N)ine', '3', 275, 575, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 89: Dries Van Noten Bomber - LISTED
('Dries Van Noten Bomber', 'Dries Van Noten', 'M', 175, 375, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 90: Yohji Yamamoto Cropped Blazer - LISTED
('Yohji Yamamoto Cropped Blazer', 'Yohji Yamamoto', '2', 145, 325, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 91: Maison Margiela Bianchetto GATs - ARCHIVE-HOLD (FAKE)
('Maison Margiela Bianchetto GATs', 'Maison Margiela', '43', 289, NULL, NULL, NULL, NULL, 'Grailed', 'Shared', NULL, 'archive-hold', 'footwear', 'Fake'),
-- Row 92: Undercover Languid Hoodie - LISTED
('Undercover Languid Hoodie', 'Undercover', '3', 165, 375, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 93: Stone Island Marina Overshirt - LISTED
('Stone Island Marina Overshirt', 'Stone Island', 'L', 145, 325, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'tops', NULL),
-- Row 94: Raf Simons Parachute Bomber - LISTED
('Raf Simons Parachute Bomber', 'Raf Simons', 'S', 425, 900, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 95: Dior Homme Waxed Jeans - LISTED
('Dior Homme Waxed Jeans', 'Dior Homme', '30', 185, 400, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 96: Chrome Hearts Sunglasses - SCAMMED
('Chrome Hearts Sunglasses', 'Chrome Hearts', 'OS', 231, NULL, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'scammed', 'accessories', 'Scammed'),
-- Row 97: Kapital Century Denim - LISTED
('Kapital Century Denim', 'Kapital', '32', 290, 575, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 98: Helmut Lang Bondage Harness - LISTED
('Helmut Lang Bondage Harness', 'Helmut Lang', 'OS', 175, 400, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'accessories', NULL),
-- Row 99: Undercover Guruguru Hoodie - LISTED
('Undercover Guruguru Hoodie', 'Undercover', '2', 200, 450, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 100: Yohji Yamamoto Wool Coat - LISTED
('Yohji Yamamoto Wool Coat', 'Yohji Yamamoto', '3', 315, 650, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 101: Chrome Hearts Rolling Stones Pendant - SCAMMED
('Chrome Hearts Rolling Stones Pendant', 'Chrome Hearts', 'OS', 180, NULL, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'scammed', 'accessories', 'Scammed'),
-- Row 102: Raf Simons Consumed Hoodie - LISTED
('Raf Simons Consumed Hoodie', 'Raf Simons', 'S', 295, 625, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 103: Number (N)ine Touch Me Im Sick Tee - LISTED
('Number (N)ine Touch Me Im Sick Tee', 'Number (N)ine', '3', 325, 700, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 104: Chrome Hearts Long Sleeve White Scroll - REFUNDED
('Chrome Hearts Long Sleeve White Scroll', 'Chrome Hearts', 'L', 220, NULL, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'refunded', 'tops', 'Refunded'),
-- Row 105: Stone Island Lino Flax Jacket - LISTED
('Stone Island Lino Flax Jacket', 'Stone Island', 'L', 185, 400, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 106: Maison Margiela Tabi Boots - LISTED
('Maison Margiela Tabi Boots', 'Maison Margiela', '43', 385, 750, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'footwear', NULL),
-- Row 107: Chrome Hearts Bracelet - REFUNDED
('Chrome Hearts Bracelet', 'Chrome Hearts', 'OS', 195, NULL, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'refunded', 'accessories', 'Refunded'),
-- Row 108: Undercover Television Tee - LISTED
('Undercover Television Tee', 'Undercover', '2', 145, 325, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 109: Yohji Yamamoto Balloon Pants - LISTED
('Yohji Yamamoto Balloon Pants', 'Yohji Yamamoto', '2', 165, 375, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 110: Raf Simons I Heart NY Sweater - LISTED
('Raf Simons I Heart NY Sweater', 'Raf Simons', 'S', 275, 575, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 111: Chrome Hearts Foti Bracelet - REFUNDED
('Chrome Hearts Foti Bracelet', 'Chrome Hearts', 'OS', 245, NULL, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'refunded', 'accessories', 'Refunding'),
-- Row 112: Chrome Hearts Tiny E Bracelet - REFUNDED
('Chrome Hearts Tiny E Bracelet', 'Chrome Hearts', 'OS', 210, NULL, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'refunded', 'accessories', 'Refunding'),
-- Row 113: Kapital Boro Jacket - LISTED
('Kapital Boro Jacket', 'Kapital', '3', 345, 725, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 114: Helmut Lang Astro Jacket - LISTED
('Helmut Lang Astro Jacket', 'Helmut Lang', 'M', 285, 600, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 115: Undercover 85 Denim - LISTED
('Undercover 85 Denim', 'Undercover', '2', 175, 400, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 116: Number (N)ine Skull Knit - LISTED
('Number (N)ine Skull Knit', 'Number (N)ine', '2', 265, 550, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 117: Stone Island Micro Reps Jacket - LISTED
('Stone Island Micro Reps Jacket', 'Stone Island', 'L', 175, 375, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 118: Raf Simons Poltergeist Parka - LISTED
('Raf Simons Poltergeist Parka', 'Raf Simons', 'S', 475, 1000, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 119: Dior Homme Safety Pin Blazer - LISTED
('Dior Homme Safety Pin Blazer', 'Dior Homme', '46', 295, 625, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 120: Yohji Yamamoto Pour Homme Cardigan - LISTED
('Yohji Yamamoto Pour Homme Cardigan', 'Yohji Yamamoto', '3', 145, 325, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'tops', NULL),
-- Row 121: Issey Miyake Bomber - SOLD
('Issey Miyake Bomber', 'Issey Miyake', 'M', 165, NULL, 285, 'grailed', '2025-01-02', 'Grailed', 'Parker Kleinman', '100/0', 'sold', 'outerwear', NULL),
-- Row 122: Maison Margiela Line 10 Blazer - LISTED
('Maison Margiela Line 10 Blazer', 'Maison Margiela', '48', 115, 275, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 123: Undercover x Nike Daybreak - LISTED
('Undercover x Nike Daybreak', 'Undercover', '9', 125, 275, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'footwear', NULL),
-- Row 124: Dries Van Noten Embroidered Jacket - LISTED
('Dries Van Noten Embroidered Jacket', 'Dries Van Noten', 'M', 225, 475, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 125: Helmut Lang Painted Denim - LISTED
('Helmut Lang Painted Denim', 'Helmut Lang', '30', 195, 425, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'bottoms', NULL),
-- Row 126: Rick Owens Geobaskets - LISTED
('Rick Owens Geobaskets', 'Rick Owens', '42', 365, 725, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'footwear', NULL),
-- Row 127: Kapital Ring Coat - LISTED
('Kapital Ring Coat', 'Kapital', '3', 395, 825, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 128: Number (N)ine Hybrid Jacket - LISTED
('Number (N)ine Hybrid Jacket', 'Number (N)ine', '3', 315, 675, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL),
-- Row 129: Stone Island David Jacket - LISTED
('Stone Island David Jacket', 'Stone Island', 'L', 285, 600, NULL, NULL, NULL, 'Grailed', 'Parker Kleinman', '100/0', 'listed', 'outerwear', NULL),
-- Row 130: Raf Simons History of My World Bomber - LISTED
('Raf Simons History of My World Bomber', 'Raf Simons', 'S', 525, 1100, NULL, NULL, NULL, 'Grailed', 'Spencer Kleinman', '0/100', 'listed', 'outerwear', NULL);