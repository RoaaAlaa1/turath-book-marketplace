-- ============================================================
-- Turath seed data - strict real-cover version
-- 240 books across the 12 categories in the supplied seed.
--
-- category_id is resolved from Categories by category name.
-- seller_id is deterministically distributed across the 6 supplied sellers.
-- age_rating varies by book/category.
-- image_url is populated by resolve_real_book_covers.py using real
-- cataloged covers from Google Books/Open Library. The SQL template will
-- refuse to be considered final while __REAL_COVER_URL_REQUIRED__ remains.
-- ============================================================

-- ============================================================
-- Seller pool supplied for this seed
-- ============================================================
DECLARE @SellerIds TABLE
(
    SellerNo INT NOT NULL PRIMARY KEY,
    SellerId NVARCHAR(450) NOT NULL
);

INSERT INTO @SellerIds (SellerNo, SellerId)
VALUES
    (1, N'e89be4a0-a929-48f1-aab9-a611b58f6be1'), -- turath_foundation
    (2, N'e89be4a0-a929-48f1-aab9-a611b58f6be2'), -- dar_al_maaref
    (3, N'e89be4a0-a929-48f1-aab9-a611b58f6be3'), -- alex_library_trust
    (4, N'e89be4a0-a929-48f1-aab9-a611b58f6be4'), -- youssef_mansour
    (5, N'e89be4a0-a929-48f1-aab9-a611b58f6be5'), -- mona_khatib
    (6, N'e89be4a0-a929-48f1-aab9-a611b58f6be6'); -- tarek_hegazy

-- 2) New categories (id auto-assigned by identity column)
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [name] = N'Arabic Literature & Classics')
    INSERT INTO [Categories] ([name], [description]) VALUES (N'Arabic Literature & Classics', NULL);
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [name] = N'Young Adult Fiction')
    INSERT INTO [Categories] ([name], [description]) VALUES (N'Young Adult Fiction', NULL);
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [name] = N'Graphic Novels & Comics')
    INSERT INTO [Categories] ([name], [description]) VALUES (N'Graphic Novels & Comics', NULL);
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [name] = N'Philosophy')
    INSERT INTO [Categories] ([name], [description]) VALUES (N'Philosophy', NULL);
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [name] = N'Religion & Islamic Studies')
    INSERT INTO [Categories] ([name], [description]) VALUES (N'Religion & Islamic Studies', NULL);
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [name] = N'Health & Wellness')
    INSERT INTO [Categories] ([name], [description]) VALUES (N'Health & Wellness', NULL);
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [name] = N'Language Learning')
    INSERT INTO [Categories] ([name], [description]) VALUES (N'Language Learning', NULL);
IF NOT EXISTS (SELECT 1 FROM [Categories] WHERE [name] = N'Travel & Adventure')
    INSERT INTO [Categories] ([name], [description]) VALUES (N'Travel & Adventure', NULL);


-- Strict-cover guard: the companion resolver replaces every placeholder
-- with a verified real cover URL before the final SQL is executed.
-- 3) Books — 20 per category, all pre-approved so they show in the shop immediately

-- Arabic Literature & Classics
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Arabic Literature & Classics')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'Midaq Alley', N'Naguib Mahfouz', N'A pre-loved copy of Midaq Alley by Naguib Mahfouz, from the Arabic Literature & Classics shelf.', 365, 5, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Palace Walk', N'Naguib Mahfouz', N'A pre-loved copy of Palace Walk by Naguib Mahfouz, from the Arabic Literature & Classics shelf.', 402, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'The Thief and the Dogs', N'Naguib Mahfouz', N'A pre-loved copy of The Thief and the Dogs by Naguib Mahfouz, from the Arabic Literature & Classics shelf.', 224, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'Season of Migration to the North', N'Tayeb Salih', N'A pre-loved copy of Season of Migration to the North by Tayeb Salih, from the Arabic Literature & Classics shelf.', 474, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Men in the Sun', N'Ghassan Kanafani', N'A pre-loved copy of Men in the Sun by Ghassan Kanafani, from the Arabic Literature & Classics shelf.', 387, 8, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Woman at Point Zero', N'Nawal El Saadawi', N'A pre-loved copy of Woman at Point Zero by Nawal El Saadawi, from the Arabic Literature & Classics shelf.', 229, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'The Hidden Face of Eve', N'Nawal El Saadawi', N'A pre-loved copy of The Hidden Face of Eve by Nawal El Saadawi, from the Arabic Literature & Classics shelf.', 309, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'Memory in the Flesh', N'Ahlam Mosteghanemi', N'A pre-loved copy of Memory in the Flesh by Ahlam Mosteghanemi, from the Arabic Literature & Classics shelf.', 244, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'The Yacoubian Building', N'Alaa Al Aswany', N'A pre-loved copy of The Yacoubian Building by Alaa Al Aswany, from the Arabic Literature & Classics shelf.', 414, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Chicago', N'Alaa Al Aswany', N'A pre-loved copy of Chicago by Alaa Al Aswany, from the Arabic Literature & Classics shelf.', 323, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Gate of the Sun', N'Elias Khoury', N'A pre-loved copy of Gate of the Sun by Elias Khoury, from the Arabic Literature & Classics shelf.', 482, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'The Story of Zahra', N'Hanan al-Shaykh', N'A pre-loved copy of The Story of Zahra by Hanan al-Shaykh, from the Arabic Literature & Classics shelf.', 230, 10, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'I Saw Ramallah', N'Mourid Barghouti', N'A pre-loved copy of I Saw Ramallah by Mourid Barghouti, from the Arabic Literature & Classics shelf.', 489, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'The Prophet', N'Kahlil Gibran', N'A pre-loved copy of The Prophet by Kahlil Gibran, from the Arabic Literature & Classics shelf.', 314, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Broken Wings', N'Kahlil Gibran', N'A pre-loved copy of Broken Wings by Kahlil Gibran, from the Arabic Literature & Classics shelf.', 498, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Sand and Foam', N'Kahlil Gibran', N'A pre-loved copy of Sand and Foam by Kahlil Gibran, from the Arabic Literature & Classics shelf.', 495, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'On Entering the Sea: The Erotic and Other Poetry of Nizar Qabbani', N'Nizar Qabbani', N'A pre-loved copy of On Entering the Sea: The Erotic and Other Poetry of Nizar Qabbani by Nizar Qabbani, from the Arabic Literature & Classics shelf.', 403, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'Unfortunately, It Was Paradise: Selected Poems', N'Mahmoud Darwish', N'A pre-loved copy of Unfortunately, It Was Paradise: Selected Poems by Mahmoud Darwish, from the Arabic Literature & Classics shelf.', 313, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Memory for Forgetfulness', N'Mahmoud Darwish', N'A pre-loved copy of Memory for Forgetfulness by Mahmoud Darwish, from the Arabic Literature & Classics shelf.', 485, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Cities of Salt', N'Abdul Rahman Munif', N'A pre-loved copy of Cities of Salt by Abdul Rahman Munif, from the Arabic Literature & Classics shelf.', 268, 6, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Arabic Literature & Classics') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END

-- Young Adult Fiction
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Young Adult Fiction')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'The Perks of Being a Wallflower', N'Stephen Chbosky', N'A pre-loved copy of The Perks of Being a Wallflower by Stephen Chbosky, from the Young Adult Fiction shelf.', 414, 5, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Speak', N'Laurie Halse Anderson', N'A pre-loved copy of Speak by Laurie Halse Anderson, from the Young Adult Fiction shelf.', 476, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Thirteen Reasons Why', N'Jay Asher', N'A pre-loved copy of Thirteen Reasons Why by Jay Asher, from the Young Adult Fiction shelf.', 492, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'The Outsiders', N'S.E. Hinton', N'A pre-loved copy of The Outsiders by S.E. Hinton, from the Young Adult Fiction shelf.', 486, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Looking for Alaska', N'John Green', N'A pre-loved copy of Looking for Alaska by John Green, from the Young Adult Fiction shelf.', 292, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Paper Towns', N'John Green', N'A pre-loved copy of Paper Towns by John Green, from the Young Adult Fiction shelf.', 497, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Divergent', N'Veronica Roth', N'A pre-loved copy of Divergent by Veronica Roth, from the Young Adult Fiction shelf.', 296, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Maze Runner', N'James Dashner', N'A pre-loved copy of The Maze Runner by James Dashner, from the Young Adult Fiction shelf.', 249, 8, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Percy Jackson and the Lightning Thief', N'Rick Riordan', N'A pre-loved copy of Percy Jackson and the Lightning Thief by Rick Riordan, from the Young Adult Fiction shelf.', 232, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Six of Crows', N'Leigh Bardugo', N'A pre-loved copy of Six of Crows by Leigh Bardugo, from the Young Adult Fiction shelf.', 230, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Shadow and Bone', N'Leigh Bardugo', N'A pre-loved copy of Shadow and Bone by Leigh Bardugo, from the Young Adult Fiction shelf.', 305, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Wonder', N'R.J. Palacio', N'A pre-loved copy of Wonder by R.J. Palacio, from the Young Adult Fiction shelf.', 472, 7, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Giver', N'Lois Lowry', N'A pre-loved copy of The Giver by Lois Lowry, from the Young Adult Fiction shelf.', 360, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Holes', N'Louis Sachar', N'A pre-loved copy of Holes by Louis Sachar, from the Young Adult Fiction shelf.', 499, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Aristotle and Dante Discover the Secrets of the Universe', N'Benjamin Alire Saenz', N'A pre-loved copy of Aristotle and Dante Discover the Secrets of the Universe by Benjamin Alire Saenz, from the Young Adult Fiction shelf.', 385, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'An Ember in the Ashes', N'Sabaa Tahir', N'A pre-loved copy of An Ember in the Ashes by Sabaa Tahir, from the Young Adult Fiction shelf.', 327, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Legend', N'Marie Lu', N'A pre-loved copy of Legend by Marie Lu, from the Young Adult Fiction shelf.', 292, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Red Queen', N'Victoria Aveyard', N'A pre-loved copy of Red Queen by Victoria Aveyard, from the Young Adult Fiction shelf.', 324, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Hate U Give', N'Angie Thomas', N'A pre-loved copy of The Hate U Give by Angie Thomas, from the Young Adult Fiction shelf.', 494, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Turtles All the Way Down', N'John Green', N'A pre-loved copy of Turtles All the Way Down by John Green, from the Young Adult Fiction shelf.', 468, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Young Adult Fiction') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END

-- Graphic Novels & Comics
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Graphic Novels & Comics')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'Watchmen', N'Alan Moore', N'A pre-loved copy of Watchmen by Alan Moore, from the Graphic Novels & Comics shelf.', 375, 9, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'Maus', N'Art Spiegelman', N'A pre-loved copy of Maus by Art Spiegelman, from the Graphic Novels & Comics shelf.', 429, 6, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Persepolis', N'Marjane Satrapi', N'A pre-loved copy of Persepolis by Marjane Satrapi, from the Graphic Novels & Comics shelf.', 237, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'V for Vendetta', N'Alan Moore', N'A pre-loved copy of V for Vendetta by Alan Moore, from the Graphic Novels & Comics shelf.', 462, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'Batman: The Killing Joke', N'Alan Moore', N'A pre-loved copy of Batman: The Killing Joke by Alan Moore, from the Graphic Novels & Comics shelf.', 284, 10, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'Saga, Vol. 1', N'Brian K. Vaughan', N'A pre-loved copy of Saga, Vol. 1 by Brian K. Vaughan, from the Graphic Novels & Comics shelf.', 375, 5, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Sandman: Preludes and Nocturnes', N'Neil Gaiman', N'A pre-loved copy of The Sandman: Preludes and Nocturnes by Neil Gaiman, from the Graphic Novels & Comics shelf.', 450, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Fun Home', N'Alison Bechdel', N'A pre-loved copy of Fun Home by Alison Bechdel, from the Graphic Novels & Comics shelf.', 220, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'Batman: Year One', N'Frank Miller', N'A pre-loved copy of Batman: Year One by Frank Miller, from the Graphic Novels & Comics shelf.', 239, 10, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Walking Dead, Vol. 1', N'Robert Kirkman', N'A pre-loved copy of The Walking Dead, Vol. 1 by Robert Kirkman, from the Graphic Novels & Comics shelf.', 485, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Bone', N'Jeff Smith', N'A pre-loved copy of Bone by Jeff Smith, from the Graphic Novels & Comics shelf.', 360, 6, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Ms. Marvel, Vol. 1', N'G. Willow Wilson', N'A pre-loved copy of Ms. Marvel, Vol. 1 by G. Willow Wilson, from the Graphic Novels & Comics shelf.', 379, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Scott Pilgrim''s Precious Little Life', N'Bryan Lee O''Malley', N'A pre-loved copy of Scott Pilgrim''s Precious Little Life by Bryan Lee O''Malley, from the Graphic Novels & Comics shelf.', 454, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Y: The Last Man, Vol. 1', N'Brian K. Vaughan', N'A pre-loved copy of Y: The Last Man, Vol. 1 by Brian K. Vaughan, from the Graphic Novels & Comics shelf.', 433, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'Blankets', N'Craig Thompson', N'A pre-loved copy of Blankets by Craig Thompson, from the Graphic Novels & Comics shelf.', 247, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'American Born Chinese', N'Gene Luen Yang', N'A pre-loved copy of American Born Chinese by Gene Luen Yang, from the Graphic Novels & Comics shelf.', 442, 9, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Astonishing X-Men, Vol. 1', N'Joss Whedon', N'A pre-loved copy of Astonishing X-Men, Vol. 1 by Joss Whedon, from the Graphic Novels & Comics shelf.', 233, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Hellboy: Seed of Destruction', N'Mike Mignola', N'A pre-loved copy of Hellboy: Seed of Destruction by Mike Mignola, from the Graphic Novels & Comics shelf.', 358, 9, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Habibi', N'Craig Thompson', N'A pre-loved copy of Habibi by Craig Thompson, from the Graphic Novels & Comics shelf.', 495, 9, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'18+'),
        (N'Nimona', N'Noelle Stevenson', N'A pre-loved copy of Nimona by Noelle Stevenson, from the Graphic Novels & Comics shelf.', 428, 6, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Graphic Novels & Comics') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END

-- Philosophy
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Philosophy')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'Meditations', N'Marcus Aurelius', N'A pre-loved copy of Meditations by Marcus Aurelius, from the Philosophy shelf.', 397, 9, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'The Republic', N'Plato', N'A pre-loved copy of The Republic by Plato, from the Philosophy shelf.', 377, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Nicomachean Ethics', N'Aristotle', N'A pre-loved copy of Nicomachean Ethics by Aristotle, from the Philosophy shelf.', 436, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Beyond Good and Evil', N'Friedrich Nietzsche', N'A pre-loved copy of Beyond Good and Evil by Friedrich Nietzsche, from the Philosophy shelf.', 286, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Thus Spoke Zarathustra', N'Friedrich Nietzsche', N'A pre-loved copy of Thus Spoke Zarathustra by Friedrich Nietzsche, from the Philosophy shelf.', 259, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'The Prince', N'Niccolo Machiavelli', N'A pre-loved copy of The Prince by Niccolo Machiavelli, from the Philosophy shelf.', 230, 5, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Being and Time', N'Martin Heidegger', N'A pre-loved copy of Being and Time by Martin Heidegger, from the Philosophy shelf.', 347, 5, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Critique of Pure Reason', N'Immanuel Kant', N'A pre-loved copy of Critique of Pure Reason by Immanuel Kant, from the Philosophy shelf.', 326, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'The Social Contract', N'Jean-Jacques Rousseau', N'A pre-loved copy of The Social Contract by Jean-Jacques Rousseau, from the Philosophy shelf.', 400, 10, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Discourse on Method', N'Rene Descartes', N'A pre-loved copy of Discourse on Method by Rene Descartes, from the Philosophy shelf.', 454, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'The Muqaddimah', N'Ibn Khaldun', N'A pre-loved copy of The Muqaddimah by Ibn Khaldun, from the Philosophy shelf.', 285, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'The Incoherence of the Philosophers', N'Al-Ghazali', N'A pre-loved copy of The Incoherence of the Philosophers by Al-Ghazali, from the Philosophy shelf.', 405, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'The Incoherence of the Incoherence', N'Ibn Rushd (Averroes)', N'A pre-loved copy of The Incoherence of the Incoherence by Ibn Rushd (Averroes), from the Philosophy shelf.', 342, 5, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'The Book of Healing', N'Ibn Sina (Avicenna)', N'A pre-loved copy of The Book of Healing by Ibn Sina (Avicenna), from the Philosophy shelf.', 420, 10, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'The Alchemy of Happiness', N'Al-Ghazali', N'A pre-loved copy of The Alchemy of Happiness by Al-Ghazali, from the Philosophy shelf.', 481, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Existentialism Is a Humanism', N'Jean-Paul Sartre', N'A pre-loved copy of Existentialism Is a Humanism by Jean-Paul Sartre, from the Philosophy shelf.', 412, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'The Myth of Sisyphus', N'Albert Camus', N'A pre-loved copy of The Myth of Sisyphus by Albert Camus, from the Philosophy shelf.', 394, 5, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'A Theory of Justice', N'John Rawls', N'A pre-loved copy of A Theory of Justice by John Rawls, from the Philosophy shelf.', 277, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Letters from a Stoic', N'Seneca', N'A pre-loved copy of Letters from a Stoic by Seneca, from the Philosophy shelf.', 290, 5, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'The Consolation of Philosophy', N'Boethius', N'A pre-loved copy of The Consolation of Philosophy by Boethius, from the Philosophy shelf.', 318, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Philosophy') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END

-- Religion & Islamic Studies
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Religion & Islamic Studies')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'The Sealed Nectar', N'Safiur Rahman Mubarakpuri', N'A pre-loved copy of The Sealed Nectar by Safiur Rahman Mubarakpuri, from the Religion & Islamic Studies shelf.', 319, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Don''t Be Sad', N'Aaidh ibn Abdullah al-Qarni', N'A pre-loved copy of Don''t Be Sad by Aaidh ibn Abdullah al-Qarni, from the Religion & Islamic Studies shelf.', 448, 10, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'In the Shade of the Qur''an, Vol. 1', N'Sayyid Qutb', N'A pre-loved copy of In the Shade of the Qur''an, Vol. 1 by Sayyid Qutb, from the Religion & Islamic Studies shelf.', 293, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Milestones', N'Sayyid Qutb', N'A pre-loved copy of Milestones by Sayyid Qutb, from the Religion & Islamic Studies shelf.', 344, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Riyad as-Salihin', N'Imam An-Nawawi', N'A pre-loved copy of Riyad as-Salihin by Imam An-Nawawi, from the Religion & Islamic Studies shelf.', 274, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Al-Muwatta', N'Imam Malik ibn Anas', N'A pre-loved copy of Al-Muwatta by Imam Malik ibn Anas, from the Religion & Islamic Studies shelf.', 473, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Revival of the Religious Sciences', N'Al-Ghazali', N'A pre-loved copy of The Revival of the Religious Sciences by Al-Ghazali, from the Religion & Islamic Studies shelf.', 489, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Fiqh us-Sunnah', N'Sayyid Sabiq', N'A pre-loved copy of Fiqh us-Sunnah by Sayyid Sabiq, from the Religion & Islamic Studies shelf.', 264, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Tafsir Ibn Kathir, Vol. 1', N'Ibn Kathir', N'A pre-loved copy of Tafsir Ibn Kathir, Vol. 1 by Ibn Kathir, from the Religion & Islamic Studies shelf.', 463, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Purification of the Soul', N'Ahmad Farid', N'A pre-loved copy of The Purification of the Soul by Ahmad Farid, from the Religion & Islamic Studies shelf.', 227, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Stories of the Prophets', N'Ibn Kathir', N'A pre-loved copy of Stories of the Prophets by Ibn Kathir, from the Religion & Islamic Studies shelf.', 486, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Life of the Prophet Muhammad', N'Ibn Hisham', N'A pre-loved copy of The Life of the Prophet Muhammad by Ibn Hisham, from the Religion & Islamic Studies shelf.', 403, 7, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Beginning of Guidance', N'Al-Ghazali', N'A pre-loved copy of The Beginning of Guidance by Al-Ghazali, from the Religion & Islamic Studies shelf.', 401, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Book of Assistance', N'Abdallah ibn Alawi al-Haddad', N'A pre-loved copy of The Book of Assistance by Abdallah ibn Alawi al-Haddad, from the Religion & Islamic Studies shelf.', 446, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Forty Hadith Qudsi', N'Imam An-Nawawi', N'A pre-loved copy of Forty Hadith Qudsi by Imam An-Nawawi, from the Religion & Islamic Studies shelf.', 405, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Road to Mecca', N'Muhammad Asad', N'A pre-loved copy of The Road to Mecca by Muhammad Asad, from the Religion & Islamic Studies shelf.', 297, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Reconstruction of Religious Thought in Islam', N'Muhammad Iqbal', N'A pre-loved copy of Reconstruction of Religious Thought in Islam by Muhammad Iqbal, from the Religion & Islamic Studies shelf.', 306, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'No god but God', N'Reza Aslan', N'A pre-loved copy of No god but God by Reza Aslan, from the Religion & Islamic Studies shelf.', 283, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Muhammad: His Life Based on the Earliest Sources', N'Martin Lings', N'A pre-loved copy of Muhammad: His Life Based on the Earliest Sources by Martin Lings, from the Religion & Islamic Studies shelf.', 374, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Study Quran', N'Seyyed Hossein Nasr', N'A pre-loved copy of The Study Quran by Seyyed Hossein Nasr, from the Religion & Islamic Studies shelf.', 226, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Religion & Islamic Studies') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END

-- Health & Wellness
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Health & Wellness')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'Breath', N'James Nestor', N'A pre-loved copy of Breath by James Nestor, from the Health & Wellness shelf.', 200, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Why We Sleep', N'Matthew Walker', N'A pre-loved copy of Why We Sleep by Matthew Walker, from the Health & Wellness shelf.', 277, 8, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Blue Zones', N'Dan Buettner', N'A pre-loved copy of The Blue Zones by Dan Buettner, from the Health & Wellness shelf.', 251, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'How Not to Die', N'Michael Greger', N'A pre-loved copy of How Not to Die by Michael Greger, from the Health & Wellness shelf.', 213, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Body Keeps the Score', N'Bessel van der Kolk', N'A pre-loved copy of The Body Keeps the Score by Bessel van der Kolk, from the Health & Wellness shelf.', 306, 8, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Spark', N'John J. Ratey', N'A pre-loved copy of Spark by John J. Ratey, from the Health & Wellness shelf.', 392, 5, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Whole30', N'Melissa Hartwig', N'A pre-loved copy of The Whole30 by Melissa Hartwig, from the Health & Wellness shelf.', 329, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Eat, Move, Sleep', N'Tom Rath', N'A pre-loved copy of Eat, Move, Sleep by Tom Rath, from the Health & Wellness shelf.', 386, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Obesity Code', N'Jason Fung', N'A pre-loved copy of The Obesity Code by Jason Fung, from the Health & Wellness shelf.', 262, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'In Defense of Food', N'Michael Pollan', N'A pre-loved copy of In Defense of Food by Michael Pollan, from the Health & Wellness shelf.', 449, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Blue Zones Kitchen', N'Dan Buettner', N'A pre-loved copy of The Blue Zones Kitchen by Dan Buettner, from the Health & Wellness shelf.', 445, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Ultraprevention', N'Mark Hyman', N'A pre-loved copy of Ultraprevention by Mark Hyman, from the Health & Wellness shelf.', 359, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'The Complete Guide to Fasting', N'Jason Fung', N'A pre-loved copy of The Complete Guide to Fasting by Jason Fung, from the Health & Wellness shelf.', 273, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Anatomy of an Illness', N'Norman Cousins', N'A pre-loved copy of Anatomy of an Illness by Norman Cousins, from the Health & Wellness shelf.', 375, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Mindfulness in Plain English', N'Bhante Gunaratana', N'A pre-loved copy of Mindfulness in Plain English by Bhante Gunaratana, from the Health & Wellness shelf.', 335, 7, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Relaxation Response', N'Herbert Benson', N'A pre-loved copy of The Relaxation Response by Herbert Benson, from the Health & Wellness shelf.', 282, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Grain Brain', N'David Perlmutter', N'A pre-loved copy of Grain Brain by David Perlmutter, from the Health & Wellness shelf.', 211, 5, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Plant Paradox', N'Steven Gundry', N'A pre-loved copy of The Plant Paradox by Steven Gundry, from the Health & Wellness shelf.', 470, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'It Starts with the Egg', N'Rebecca Fett', N'A pre-loved copy of It Starts with the Egg by Rebecca Fett, from the Health & Wellness shelf.', 275, 9, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Younger Next Year', N'Chris Crowley', N'A pre-loved copy of Younger Next Year by Chris Crowley, from the Health & Wellness shelf.', 478, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Health & Wellness') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END

-- Language Learning
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Language Learning')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'Fluent Forever', N'Gabriel Wyner', N'A pre-loved copy of Fluent Forever by Gabriel Wyner, from the Language Learning shelf.', 470, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Arabic for Dummies', N'Amine Bouchentouf', N'A pre-loved copy of Arabic for Dummies by Amine Bouchentouf, from the Language Learning shelf.', 246, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Madinah Arabic Reader', N'V. Abdur Rahim', N'A pre-loved copy of Madinah Arabic Reader by V. Abdur Rahim, from the Language Learning shelf.', 333, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Easy Arabic Grammar', N'Jane Wightwick', N'A pre-loved copy of Easy Arabic Grammar by Jane Wightwick, from the Language Learning shelf.', 387, 5, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Living Language Arabic', N'Living Language', N'A pre-loved copy of Living Language Arabic by Living Language, from the Language Learning shelf.', 382, 10, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Mastering Arabic 1', N'Jane Wightwick', N'A pre-loved copy of Mastering Arabic 1 by Jane Wightwick, from the Language Learning shelf.', 314, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Al-Kitaab fii Ta''allum al-Arabiyya', N'Kristen Brustad', N'A pre-loved copy of Al-Kitaab fii Ta''allum al-Arabiyya by Kristen Brustad, from the Language Learning shelf.', 477, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'French in Action', N'Pierre Capretz', N'A pre-loved copy of French in Action by Pierre Capretz, from the Language Learning shelf.', 457, 6, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Spanish Grammar in Context', N'Rosario Gonzalez', N'A pre-loved copy of Spanish Grammar in Context by Rosario Gonzalez, from the Language Learning shelf.', 314, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'German Made Simple', N'Arnold Leitner', N'A pre-loved copy of German Made Simple by Arnold Leitner, from the Language Learning shelf.', 299, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Japanese for Busy People', N'AJALT', N'A pre-loved copy of Japanese for Busy People by AJALT, from the Language Learning shelf.', 322, 10, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'English Grammar in Use', N'Raymond Murphy', N'A pre-loved copy of English Grammar in Use by Raymond Murphy, from the Language Learning shelf.', 405, 9, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Practice Makes Perfect: Complete Arabic Grammar', N'Jane Wightwick', N'A pre-loved copy of Practice Makes Perfect: Complete Arabic Grammar by Jane Wightwick, from the Language Learning shelf.', 316, 5, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Teach Yourself Arabic', N'Jack Smart', N'A pre-loved copy of Teach Yourself Arabic by Jack Smart, from the Language Learning shelf.', 465, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'501 Arabic Verbs', N'Various Authors', N'A pre-loved copy of 501 Arabic Verbs by Various Authors, from the Language Learning shelf.', 382, 9, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Mastering Arabic Script', N'Nicholas Awde', N'A pre-loved copy of Mastering Arabic Script by Nicholas Awde, from the Language Learning shelf.', 214, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Colloquial Arabic of the Gulf', N'Clive Holes', N'A pre-loved copy of Colloquial Arabic of the Gulf by Clive Holes, from the Language Learning shelf.', 343, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Modern Standard Arabic Grammar', N'Mahdi Alosh', N'A pre-loved copy of Modern Standard Arabic Grammar by Mahdi Alosh, from the Language Learning shelf.', 332, 5, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Breaking the Arabic Code', N'Various Authors', N'A pre-loved copy of Breaking the Arabic Code by Various Authors, from the Language Learning shelf.', 376, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'10+'),
        (N'Ultimate Arabic Beginner-Intermediate', N'Living Language', N'A pre-loved copy of Ultimate Arabic Beginner-Intermediate by Living Language, from the Language Learning shelf.', 378, 6, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'10+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Language Learning') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END

-- Travel & Adventure
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Travel & Adventure')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'The Travels of Ibn Battuta', N'Ibn Battuta', N'A pre-loved copy of The Travels of Ibn Battuta by Ibn Battuta, from the Travel & Adventure shelf.', 241, 5, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Into Thin Air', N'Jon Krakauer', N'A pre-loved copy of Into Thin Air by Jon Krakauer, from the Travel & Adventure shelf.', 252, 5, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'A Walk in the Woods', N'Bill Bryson', N'A pre-loved copy of A Walk in the Woods by Bill Bryson, from the Travel & Adventure shelf.', 440, 5, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Eat, Pray, Love', N'Elizabeth Gilbert', N'A pre-loved copy of Eat, Pray, Love by Elizabeth Gilbert, from the Travel & Adventure shelf.', 372, 5, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'In Patagonia', N'Bruce Chatwin', N'A pre-loved copy of In Patagonia by Bruce Chatwin, from the Travel & Adventure shelf.', 447, 8, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Great Railway Bazaar', N'Paul Theroux', N'A pre-loved copy of The Great Railway Bazaar by Paul Theroux, from the Travel & Adventure shelf.', 200, 7, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Travels with Charley', N'John Steinbeck', N'A pre-loved copy of Travels with Charley by John Steinbeck, from the Travel & Adventure shelf.', 376, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Songlines', N'Bruce Chatwin', N'A pre-loved copy of The Songlines by Bruce Chatwin, from the Travel & Adventure shelf.', 243, 10, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Video Night in Kathmandu', N'Pico Iyer', N'A pre-loved copy of Video Night in Kathmandu by Pico Iyer, from the Travel & Adventure shelf.', 261, 7, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Down and Out in Paris and London', N'George Orwell', N'A pre-loved copy of Down and Out in Paris and London by George Orwell, from the Travel & Adventure shelf.', 302, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Seven Years in Tibet', N'Heinrich Harrer', N'A pre-loved copy of Seven Years in Tibet by Heinrich Harrer, from the Travel & Adventure shelf.', 291, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'West with the Night', N'Beryl Markham', N'A pre-loved copy of West with the Night by Beryl Markham, from the Travel & Adventure shelf.', 370, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Arabian Sands', N'Wilfred Thesiger', N'A pre-loved copy of Arabian Sands by Wilfred Thesiger, from the Travel & Adventure shelf.', 402, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'A Year in Provence', N'Peter Mayle', N'A pre-loved copy of A Year in Provence by Peter Mayle, from the Travel & Adventure shelf.', 405, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Shantaram', N'Gregory David Roberts', N'A pre-loved copy of Shantaram by Gregory David Roberts, from the Travel & Adventure shelf.', 243, 9, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Sheltering Sky', N'Paul Bowles', N'A pre-loved copy of The Sheltering Sky by Paul Bowles, from the Travel & Adventure shelf.', 281, 5, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'On the Road', N'Jack Kerouac', N'A pre-loved copy of On the Road by Jack Kerouac, from the Travel & Adventure shelf.', 265, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Motorcycle Diaries', N'Ernesto Che Guevara', N'A pre-loved copy of The Motorcycle Diaries by Ernesto Che Guevara, from the Travel & Adventure shelf.', 277, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Wild Swans', N'Jung Chang', N'A pre-loved copy of Wild Swans by Jung Chang, from the Travel & Adventure shelf.', 438, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Vagabonding', N'Rolf Potts', N'A pre-loved copy of Vagabonding by Rolf Potts, from the Travel & Adventure shelf.', 274, 8, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Travel & Adventure') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END
-- ============================================================
-- Round 3: 20 books for the 4 EXISTING categories too
-- (Fiction, Science & Technology, Children's Books, History)
-- Same $200-500 integer price / 4-10 quantity rules.
-- ============================================================

-- Fiction
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Fiction')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'To Kill a Mockingbird', N'Harper Lee', N'A pre-loved copy of To Kill a Mockingbird by Harper Lee, from the Fiction shelf.', 442, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'1984', N'George Orwell', N'A pre-loved copy of 1984 by George Orwell, from the Fiction shelf.', 279, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Pride and Prejudice', N'Jane Austen', N'A pre-loved copy of Pride and Prejudice by Jane Austen, from the Fiction shelf.', 267, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Great Gatsby', N'F. Scott Fitzgerald', N'A pre-loved copy of The Great Gatsby by F. Scott Fitzgerald, from the Fiction shelf.', 252, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'One Hundred Years of Solitude', N'Gabriel Garcia Marquez', N'A pre-loved copy of One Hundred Years of Solitude by Gabriel Garcia Marquez, from the Fiction shelf.', 271, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Catcher in the Rye', N'J.D. Salinger', N'A pre-loved copy of The Catcher in the Rye by J.D. Salinger, from the Fiction shelf.', 308, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Brave New World', N'Aldous Huxley', N'A pre-loved copy of Brave New World by Aldous Huxley, from the Fiction shelf.', 308, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Crime and Punishment', N'Fyodor Dostoevsky', N'A pre-loved copy of Crime and Punishment by Fyodor Dostoevsky, from the Fiction shelf.', 323, 10, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Beloved', N'Toni Morrison', N'A pre-loved copy of Beloved by Toni Morrison, from the Fiction shelf.', 366, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Slaughterhouse-Five', N'Kurt Vonnegut', N'A pre-loved copy of Slaughterhouse-Five by Kurt Vonnegut, from the Fiction shelf.', 414, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Road', N'Cormac McCarthy', N'A pre-loved copy of The Road by Cormac McCarthy, from the Fiction shelf.', 231, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Wuthering Heights', N'Emily Bronte', N'A pre-loved copy of Wuthering Heights by Emily Bronte, from the Fiction shelf.', 434, 9, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Anna Karenina', N'Leo Tolstoy', N'A pre-loved copy of Anna Karenina by Leo Tolstoy, from the Fiction shelf.', 464, 7, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Norwegian Wood', N'Haruki Murakami', N'A pre-loved copy of Norwegian Wood by Haruki Murakami, from the Fiction shelf.', 266, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'15+'),
        (N'Life of Pi', N'Yann Martel', N'A pre-loved copy of Life of Pi by Yann Martel, from the Fiction shelf.', 468, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'In Search of Walid Masoud', N'Jabra Ibrahim Jabra', N'A pre-loved copy of In Search of Walid Masoud by Jabra Ibrahim Jabra, from the Fiction shelf.', 425, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Frankenstein in Baghdad', N'Ahmed Saadawi', N'A pre-loved copy of Frankenstein in Baghdad by Ahmed Saadawi, from the Fiction shelf.', 202, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'The Corpse Washer', N'Sinan Antoon', N'A pre-loved copy of The Corpse Washer by Sinan Antoon, from the Fiction shelf.', 288, 5, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'The Bamboo Stalk', N'Saud Alsanousi', N'A pre-loved copy of The Bamboo Stalk by Saud Alsanousi, from the Fiction shelf.', 261, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Beer in the Snooker Club', N'Waguih Ghali', N'A pre-loved copy of Beer in the Snooker Club by Waguih Ghali, from the Fiction shelf.', 366, 9, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'16+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Fiction') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END

-- Science & Technology
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Science & Technology')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'A Brief History of Time', N'Stephen Hawking', N'A pre-loved copy of A Brief History of Time by Stephen Hawking, from the Science & Technology shelf.', 471, 8, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Sapiens', N'Yuval Noah Harari', N'A pre-loved copy of Sapiens by Yuval Noah Harari, from the Science & Technology shelf.', 254, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Selfish Gene', N'Richard Dawkins', N'A pre-loved copy of The Selfish Gene by Richard Dawkins, from the Science & Technology shelf.', 327, 5, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Cosmos', N'Carl Sagan', N'A pre-loved copy of Cosmos by Carl Sagan, from the Science & Technology shelf.', 221, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Gene', N'Siddhartha Mukherjee', N'A pre-loved copy of The Gene by Siddhartha Mukherjee, from the Science & Technology shelf.', 459, 7, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Astrophysics for People in a Hurry', N'Neil deGrasse Tyson', N'A pre-loved copy of Astrophysics for People in a Hurry by Neil deGrasse Tyson, from the Science & Technology shelf.', 214, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Innovators', N'Walter Isaacson', N'A pre-loved copy of The Innovators by Walter Isaacson, from the Science & Technology shelf.', 426, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Thinking, Fast and Slow', N'Daniel Kahneman', N'A pre-loved copy of Thinking, Fast and Slow by Daniel Kahneman, from the Science & Technology shelf.', 458, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'The Code Book', N'Simon Singh', N'A pre-loved copy of The Code Book by Simon Singh, from the Science & Technology shelf.', 302, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Silent Spring', N'Rachel Carson', N'A pre-loved copy of Silent Spring by Rachel Carson, from the Science & Technology shelf.', 431, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Structure of Scientific Revolutions', N'Thomas Kuhn', N'A pre-loved copy of The Structure of Scientific Revolutions by Thomas Kuhn, from the Science & Technology shelf.', 444, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Guns, Germs, and Steel', N'Jared Diamond', N'A pre-loved copy of Guns, Germs, and Steel by Jared Diamond, from the Science & Technology shelf.', 467, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Emperor of All Maladies', N'Siddhartha Mukherjee', N'A pre-loved copy of The Emperor of All Maladies by Siddhartha Mukherjee, from the Science & Technology shelf.', 303, 10, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Clean Code', N'Robert C. Martin', N'A pre-loved copy of Clean Code by Robert C. Martin, from the Science & Technology shelf.', 270, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Pragmatic Programmer', N'Andrew Hunt', N'A pre-loved copy of The Pragmatic Programmer by Andrew Hunt, from the Science & Technology shelf.', 400, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Superintelligence', N'Nick Bostrom', N'A pre-loved copy of Superintelligence by Nick Bostrom, from the Science & Technology shelf.', 237, 9, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Chaos: Making a New Science', N'James Gleick', N'A pre-loved copy of Chaos: Making a New Science by James Gleick, from the Science & Technology shelf.', 419, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Immortal Life of Henrietta Lacks', N'Rebecca Skloot', N'A pre-loved copy of The Immortal Life of Henrietta Lacks by Rebecca Skloot, from the Science & Technology shelf.', 355, 10, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Elon Musk', N'Walter Isaacson', N'A pre-loved copy of Elon Musk by Walter Isaacson, from the Science & Technology shelf.', 279, 9, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Weapons of Math Destruction', N'Cathy O''Neil', N'A pre-loved copy of Weapons of Math Destruction by Cathy O''Neil, from the Science & Technology shelf.', 387, 5, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'16+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Science & Technology') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END

-- Children's Books
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'Children''s Books')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'Charlotte''s Web', N'E.B. White', N'A pre-loved copy of Charlotte''s Web by E.B. White, from the Children''s Books shelf.', 270, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'Matilda', N'Roald Dahl', N'A pre-loved copy of Matilda by Roald Dahl, from the Children''s Books shelf.', 248, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'The Very Hungry Caterpillar', N'Eric Carle', N'A pre-loved copy of The Very Hungry Caterpillar by Eric Carle, from the Children''s Books shelf.', 283, 9, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'Where the Wild Things Are', N'Maurice Sendak', N'A pre-loved copy of Where the Wild Things Are by Maurice Sendak, from the Children''s Books shelf.', 282, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'The Cat in the Hat', N'Dr. Seuss', N'A pre-loved copy of The Cat in the Hat by Dr. Seuss, from the Children''s Books shelf.', 463, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'Charlie and the Chocolate Factory', N'Roald Dahl', N'A pre-loved copy of Charlie and the Chocolate Factory by Roald Dahl, from the Children''s Books shelf.', 415, 5, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'The Giving Tree', N'Shel Silverstein', N'A pre-loved copy of The Giving Tree by Shel Silverstein, from the Children''s Books shelf.', 363, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'James and the Giant Peach', N'Roald Dahl', N'A pre-loved copy of James and the Giant Peach by Roald Dahl, from the Children''s Books shelf.', 387, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'The Tale of Peter Rabbit', N'Beatrix Potter', N'A pre-loved copy of The Tale of Peter Rabbit by Beatrix Potter, from the Children''s Books shelf.', 483, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'Winnie-the-Pooh', N'A.A. Milne', N'A pre-loved copy of Winnie-the-Pooh by A.A. Milne, from the Children''s Books shelf.', 209, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'The Wind in the Willows', N'Kenneth Grahame', N'A pre-loved copy of The Wind in the Willows by Kenneth Grahame, from the Children''s Books shelf.', 464, 8, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'Alice''s Adventures in Wonderland', N'Lewis Carroll', N'A pre-loved copy of Alice''s Adventures in Wonderland by Lewis Carroll, from the Children''s Books shelf.', 462, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'The Secret Garden', N'Frances Hodgson Burnett', N'A pre-loved copy of The Secret Garden by Frances Hodgson Burnett, from the Children''s Books shelf.', 317, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'Goodnight Moon', N'Margaret Wise Brown', N'A pre-loved copy of Goodnight Moon by Margaret Wise Brown, from the Children''s Books shelf.', 335, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'The Lion, the Witch and the Wardrobe', N'C.S. Lewis', N'A pre-loved copy of The Lion, the Witch and the Wardrobe by C.S. Lewis, from the Children''s Books shelf.', 292, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'Green Eggs and Ham', N'Dr. Seuss', N'A pre-loved copy of Green Eggs and Ham by Dr. Seuss, from the Children''s Books shelf.', 416, 10, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'Corduroy', N'Don Freeman', N'A pre-loved copy of Corduroy by Don Freeman, from the Children''s Books shelf.', 332, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'The BFG', N'Roald Dahl', N'A pre-loved copy of The BFG by Roald Dahl, from the Children''s Books shelf.', 474, 8, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'Stuart Little', N'E.B. White', N'A pre-loved copy of Stuart Little by E.B. White, from the Children''s Books shelf.', 453, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'6+'),
        (N'Little Women', N'Louisa May Alcott', N'A pre-loved copy of Little Women by Louisa May Alcott, from the Children''s Books shelf.', 245, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'10+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'Children''s Books') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END

-- History
IF NOT EXISTS (SELECT 1 FROM [Books] b INNER JOIN [Categories] c ON b.[category_id] = c.[id] WHERE c.[name] = N'History')
BEGIN
    INSERT INTO [Books] ([title], [author], [description], [price], [quantity], [category_id], [seller_id], [image_url], [condition], [age_rating], [approval_status])
    SELECT v.title, v.author, v.description, v.price, v.quantity, c.[id],
        s.SellerId, v.image_url, v.condition, v.age_rating, N'Approved'
    FROM (VALUES
        (N'A People''s History of the United States', N'Howard Zinn', N'A pre-loved copy of A People''s History of the United States by Howard Zinn, from the History shelf.', 293, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Guns of August', N'Barbara W. Tuchman', N'A pre-loved copy of The Guns of August by Barbara W. Tuchman, from the History shelf.', 337, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'SPQR', N'Mary Beard', N'A pre-loved copy of SPQR by Mary Beard, from the History shelf.', 245, 10, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Diary of a Young Girl', N'Anne Frank', N'A pre-loved copy of The Diary of a Young Girl by Anne Frank, from the History shelf.', 242, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'1776', N'David McCullough', N'A pre-loved copy of 1776 by David McCullough, from the History shelf.', 234, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Rise and Fall of the Third Reich', N'William L. Shirer', N'A pre-loved copy of The Rise and Fall of the Third Reich by William L. Shirer, from the History shelf.', 432, 4, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'A Short History of Nearly Everything', N'Bill Bryson', N'A pre-loved copy of A Short History of Nearly Everything by Bill Bryson, from the History shelf.', 483, 7, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Silk Roads', N'Peter Frankopan', N'A pre-loved copy of The Silk Roads by Peter Frankopan, from the History shelf.', 266, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Team of Rivals', N'Doris Kearns Goodwin', N'A pre-loved copy of Team of Rivals by Doris Kearns Goodwin, from the History shelf.', 322, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Wright Brothers', N'David McCullough', N'A pre-loved copy of The Wright Brothers by David McCullough, from the History shelf.', 334, 4, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Salt: A World History', N'Mark Kurlansky', N'A pre-loved copy of Salt: A World History by Mark Kurlansky, from the History shelf.', 303, 6, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Postwar', N'Tony Judt', N'A pre-loved copy of Postwar by Tony Judt, from the History shelf.', 356, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Splendid and the Vile', N'Erik Larson', N'A pre-loved copy of The Splendid and the Vile by Erik Larson, from the History shelf.', 348, 7, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Warmth of Other Suns', N'Isabel Wilkerson', N'A pre-loved copy of The Warmth of Other Suns by Isabel Wilkerson, from the History shelf.', 291, 6, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Dead Wake', N'Erik Larson', N'A pre-loved copy of Dead Wake by Erik Larson, from the History shelf.', 209, 6, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Destiny Disrupted: A History of the World Through Islamic Eyes', N'Tamim Ansary', N'A pre-loved copy of Destiny Disrupted: A History of the World Through Islamic Eyes by Tamim Ansary, from the History shelf.', 207, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'The Great Arab Conquests', N'Hugh Kennedy', N'A pre-loved copy of The Great Arab Conquests by Hugh Kennedy, from the History shelf.', 458, 8, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'A History of the Arab Peoples', N'Albert Hourani', N'A pre-loved copy of A History of the Arab Peoples by Albert Hourani, from the History shelf.', 463, 7, N'LikeNew', N'__REAL_COVER_URL_REQUIRED__', N'13+'),
        (N'Arabs: A 3,000-Year History', N'Tim Mackintosh-Smith', N'A pre-loved copy of Arabs: A 3,000-Year History by Tim Mackintosh-Smith, from the History shelf.', 428, 4, N'Acceptable', N'__REAL_COVER_URL_REQUIRED__', N'16+'),
        (N'Ottoman Centuries', N'Lord Kinross', N'A pre-loved copy of Ottoman Centuries by Lord Kinross, from the History shelf.', 421, 9, N'Good', N'__REAL_COVER_URL_REQUIRED__', N'13+')
    ) AS v(title, author, description, price, quantity, condition, image_url, age_rating)
    CROSS JOIN (SELECT [id] FROM [Categories] WHERE [name] = N'History') c
    CROSS APPLY (SELECT SellerId FROM @SellerIds WHERE SellerNo = (ABS(CONVERT(BIGINT, CHECKSUM(v.title))) % 6) + 1) s;
END