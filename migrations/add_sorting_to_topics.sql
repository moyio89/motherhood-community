-- Add sorting column to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS sorting VARCHAR(255);

-- Update existing topics with default sorting values based on category
UPDATE topics SET sorting = 'دروس' WHERE sorting IS NULL AND category = 'الحمل والولادة';
UPDATE topics SET sorting = 'أسئلة' WHERE sorting IS NULL AND category = 'تربية الأطفال';
UPDATE topics SET sorting = 'مشاريع' WHERE sorting IS NULL AND category = 'الصحة والتغذية';
UPDATE topics SET sorting = 'نقاشات' WHERE sorting IS NULL AND category = 'النمو والتطور';
UPDATE topics SET sorting = 'دروس' WHERE sorting IS NULL AND category = 'الدعم النفسي';
UPDATE topics SET sorting = 'أسئلة' WHERE sorting IS NULL AND category = 'أخرى';
