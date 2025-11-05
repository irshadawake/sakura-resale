-- Migration: Add Subcategory Support
-- Date: 2025-11-05
-- Description: Add parent_id to categories table and restructure categories

-- Step 1: Add parent_id column
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Step 2: Add index for parent_id lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Step 3: Add comment
COMMENT ON COLUMN categories.parent_id IS 'Parent category ID for subcategories. NULL for top-level categories.';

-- Step 4: Create a temporary table to store category ID mappings
CREATE TEMP TABLE category_id_mapping (
    old_category_id UUID,
    new_category_id UUID
);

-- Step 5: Get current electronics category ID for mapping
DO $$
DECLARE
    old_electronics_id UUID;
    old_bulk_sale_id UUID;
    new_electronics_id UUID;
    new_bulk_sale_id UUID;
BEGIN
    -- Get old IDs
    SELECT id INTO old_electronics_id FROM categories WHERE slug = 'electronics' LIMIT 1;
    SELECT id INTO old_bulk_sale_id FROM categories WHERE slug = 'bulk-sale' LIMIT 1;
    
    -- Insert parent categories
    INSERT INTO categories (name, slug, icon, description, display_order, parent_id) 
    VALUES ('Cars', 'cars', '🚗', 'All types of vehicles', 1, NULL)
    ON CONFLICT (slug) DO NOTHING;
    
    INSERT INTO categories (name, slug, icon, description, display_order, parent_id)
    VALUES ('Properties', 'properties', '🏠', 'Real estate and properties', 10, NULL)
    ON CONFLICT (slug) DO NOTHING;
    
    -- Update Electronics if it exists, otherwise insert
    IF old_electronics_id IS NOT NULL THEN
        UPDATE categories 
        SET name = 'Electronics & Appliances',
            slug = 'electronics-appliances',
            icon = '📱',
            description = 'Electronic devices and appliances',
            display_order = 20
        WHERE id = old_electronics_id;
        new_electronics_id := old_electronics_id;
    ELSE
        INSERT INTO categories (name, slug, icon, description, display_order, parent_id)
        VALUES ('Electronics & Appliances', 'electronics-appliances', '📱', 'Electronic devices and appliances', 20, NULL)
        RETURNING id INTO new_electronics_id;
    END IF;
    
    -- Store mapping
    IF old_electronics_id IS NOT NULL THEN
        INSERT INTO category_id_mapping VALUES (old_electronics_id, new_electronics_id);
    END IF;
    
    -- Insert more parent categories
    INSERT INTO categories (name, slug, icon, description, display_order, parent_id)
    VALUES 
        ('Mobiles', 'mobiles', '📱', 'Mobile phones and accessories', 40, NULL),
        ('Commercial Vehicles & Spares', 'commercial-vehicles', '🚛', 'Commercial vehicles and parts', 50, NULL),
        ('Jobs', 'jobs', '💼', 'Job opportunities', 60, NULL),
        ('Pets', 'pets', '🐾', 'Pets and pet supplies', 100, NULL),
        ('Books, Sports & Hobbies', 'books-sports-hobbies', '📚', 'Books, sports and hobby items', 110, NULL),
        ('Services', 'services', '🛠️', 'Professional services', 120, NULL)
    ON CONFLICT (slug) DO NOTHING;
    
    -- Update Furniture if exists
    UPDATE categories SET display_order = 80 WHERE slug = 'furniture';
    
    -- Update Fashion if exists
    UPDATE categories SET name = 'Fashion', slug = 'fashion', icon = '👗', display_order = 90 WHERE slug = 'clothing';
    
    -- Update or ensure Bundle Sale exists
    IF old_bulk_sale_id IS NOT NULL THEN
        UPDATE categories 
        SET name = 'Bundle Sale', display_order = 200
        WHERE id = old_bulk_sale_id;
    ELSE
        INSERT INTO categories (name, slug, icon, description, display_order, parent_id)
        VALUES ('Bundle Sale', 'bulk-sale', '📦', 'Multiple items sold together as a bundle', 200, NULL)
        ON CONFLICT (slug) DO NOTHING;
    END IF;
    
    -- Ensure Free Giveaways exists
    INSERT INTO categories (name, slug, icon, description, display_order, parent_id)
    VALUES ('Free Giveaways', 'free-giveaways', '🎁', 'Free items and giveaways', 201, NULL)
    ON CONFLICT (slug) DO NOTHING;
    
END $$;

-- Step 6: Insert subcategories for Cars
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('Bikes', 'cars-bikes', '🚲', 'Bicycles for all ages', 2, (SELECT id FROM categories WHERE slug = 'cars')),
('Motorcycles', 'cars-motorcycles', '🏍️', 'Motorcycles and motorbikes', 3, (SELECT id FROM categories WHERE slug = 'cars')),
('Scooters', 'cars-scooters', '🛵', 'Scooters and mopeds', 4, (SELECT id FROM categories WHERE slug = 'cars')),
('Spare Parts', 'cars-spare-parts', '🔧', 'Vehicle spare parts', 5, (SELECT id FROM categories WHERE slug = 'cars')),
('Bicycles', 'cars-bicycles', '🚴', 'Bicycles and cycling gear', 6, (SELECT id FROM categories WHERE slug = 'cars'))
ON CONFLICT (slug) DO NOTHING;

-- Properties subcategories
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('For Sale: Houses & Apartments', 'properties-for-sale-houses', '🏘️', 'Houses and apartments for sale', 11, (SELECT id FROM categories WHERE slug = 'properties')),
('For Rent: Houses & Apartments', 'properties-for-rent-houses', '🏢', 'Houses and apartments for rent', 12, (SELECT id FROM categories WHERE slug = 'properties')),
('Lands & Plots', 'properties-lands-plots', '🏞️', 'Land and plots for sale', 13, (SELECT id FROM categories WHERE slug = 'properties')),
('For Rent: Shops & Offices', 'properties-for-rent-shops', '🏪', 'Commercial spaces for rent', 14, (SELECT id FROM categories WHERE slug = 'properties')),
('For Sale: Shops & Offices', 'properties-for-sale-shops', '🏬', 'Commercial spaces for sale', 15, (SELECT id FROM categories WHERE slug = 'properties')),
('PG & Guest Houses', 'properties-pg-guest-houses', '🏨', 'Paying guest and guest houses', 16, (SELECT id FROM categories WHERE slug = 'properties'))
ON CONFLICT (slug) DO NOTHING;

-- Electronics subcategories
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('TVs, Video - Audio', 'electronics-tv-video-audio', '📺', 'TVs and audio equipment', 21, (SELECT id FROM categories WHERE slug = 'electronics-appliances')),
('Kitchen & Other Appliances', 'electronics-kitchen-appliances', '🍳', 'Kitchen and home appliances', 22, (SELECT id FROM categories WHERE slug = 'electronics-appliances')),
('Computers & Laptops', 'electronics-computers-laptops', '💻', 'Computers, laptops and PCs', 23, (SELECT id FROM categories WHERE slug = 'electronics-appliances')),
('Cameras & Lenses', 'electronics-cameras-lenses', '📷', 'Cameras and photography equipment', 24, (SELECT id FROM categories WHERE slug = 'electronics-appliances')),
('Games & Entertainment', 'electronics-games-entertainment', '🎮', 'Gaming consoles and entertainment', 25, (SELECT id FROM categories WHERE slug = 'electronics-appliances')),
('Fridges', 'electronics-fridges', '🧊', 'Refrigerators and freezers', 26, (SELECT id FROM categories WHERE slug = 'electronics-appliances')),
('Computer Accessories', 'electronics-computer-accessories', '⌨️', 'Computer accessories and peripherals', 27, (SELECT id FROM categories WHERE slug = 'electronics-appliances')),
('Hard Disks, Printers & Monitors', 'electronics-hdd-printers-monitors', '🖨️', 'Storage, printers and displays', 28, (SELECT id FROM categories WHERE slug = 'electronics-appliances')),
('ACs', 'electronics-acs', '❄️', 'Air conditioners', 29, (SELECT id FROM categories WHERE slug = 'electronics-appliances')),
('Washing Machines', 'electronics-washing-machines', '🧺', 'Washing machines and dryers', 30, (SELECT id FROM categories WHERE slug = 'electronics-appliances'))
ON CONFLICT (slug) DO NOTHING;

-- Mobiles subcategories
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('Mobile Phones', 'mobiles-phones', '📞', 'Smartphones and mobile phones', 41, (SELECT id FROM categories WHERE slug = 'mobiles')),
('Accessories', 'mobiles-accessories', '🎧', 'Mobile phone accessories', 42, (SELECT id FROM categories WHERE slug = 'mobiles')),
('Tablets', 'mobiles-tablets', '📱', 'Tablets and iPads', 43, (SELECT id FROM categories WHERE slug = 'mobiles'))
ON CONFLICT (slug) DO NOTHING;

-- Commercial Vehicles subcategories
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('Commercial & Other Vehicles', 'commercial-vehicles-other', '🚚', 'Trucks, vans and commercial vehicles', 51, (SELECT id FROM categories WHERE slug = 'commercial-vehicles')),
('Spare Parts', 'commercial-vehicles-spare-parts', '🔩', 'Commercial vehicle spare parts', 52, (SELECT id FROM categories WHERE slug = 'commercial-vehicles'))
ON CONFLICT (slug) DO NOTHING;

-- Jobs subcategories
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('Data entry & Back office', 'jobs-data-entry', '📊', 'Data entry and back office jobs', 61, (SELECT id FROM categories WHERE slug = 'jobs')),
('Sales & Marketing', 'jobs-sales-marketing', '📈', 'Sales and marketing positions', 62, (SELECT id FROM categories WHERE slug = 'jobs')),
('BPO & Telecaller', 'jobs-bpo-telecaller', '📞', 'BPO and call center jobs', 63, (SELECT id FROM categories WHERE slug = 'jobs')),
('Driver', 'jobs-driver', '🚗', 'Driver positions', 64, (SELECT id FROM categories WHERE slug = 'jobs')),
('Office Assistant', 'jobs-office-assistant', '📋', 'Office assistant jobs', 65, (SELECT id FROM categories WHERE slug = 'jobs')),
('Delivery & Collection', 'jobs-delivery-collection', '📦', 'Delivery and collection jobs', 66, (SELECT id FROM categories WHERE slug = 'jobs')),
('Teacher', 'jobs-teacher', '👨‍🏫', 'Teaching positions', 67, (SELECT id FROM categories WHERE slug = 'jobs')),
('Cook', 'jobs-cook', '👨‍🍳', 'Cook and chef positions', 68, (SELECT id FROM categories WHERE slug = 'jobs')),
('Receptionist & Front office', 'jobs-receptionist', '👩‍💼', 'Reception and front office jobs', 69, (SELECT id FROM categories WHERE slug = 'jobs')),
('Operator & Technician', 'jobs-operator-technician', '🔧', 'Operator and technician jobs', 70, (SELECT id FROM categories WHERE slug = 'jobs')),
('IT Engineer & Developer', 'jobs-it-engineer-developer', '💻', 'IT and software development jobs', 71, (SELECT id FROM categories WHERE slug = 'jobs')),
('Hotel & Travel Executive', 'jobs-hotel-travel', '🏨', 'Hospitality and travel jobs', 72, (SELECT id FROM categories WHERE slug = 'jobs')),
('Accountant', 'jobs-accountant', '🧮', 'Accounting positions', 73, (SELECT id FROM categories WHERE slug = 'jobs')),
('Designer', 'jobs-designer', '🎨', 'Design positions', 74, (SELECT id FROM categories WHERE slug = 'jobs')),
('Other Jobs', 'jobs-other', '💼', 'Other job opportunities', 75, (SELECT id FROM categories WHERE slug = 'jobs'))
ON CONFLICT (slug) DO NOTHING;

-- Furniture subcategories
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('Sofa & Dining', 'furniture-sofa-dining', '🛋️', 'Sofas and dining furniture', 81, (SELECT id FROM categories WHERE slug = 'furniture')),
('Beds & Wardrobes', 'furniture-beds-wardrobes', '🛏️', 'Beds, mattresses and wardrobes', 82, (SELECT id FROM categories WHERE slug = 'furniture')),
('Home Decor & Garden', 'furniture-home-decor-garden', '🌿', 'Home decoration and garden items', 83, (SELECT id FROM categories WHERE slug = 'furniture')),
('Kids Furniture', 'furniture-kids', '🧸', 'Furniture for children', 84, (SELECT id FROM categories WHERE slug = 'furniture')),
('Other Household Items', 'furniture-other-household', '🏠', 'Other household items', 85, (SELECT id FROM categories WHERE slug = 'furniture'))
ON CONFLICT (slug) DO NOTHING;

-- Fashion subcategories
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('Men', 'fashion-men', '👔', 'Men''s fashion', 91, (SELECT id FROM categories WHERE slug = 'fashion')),
('Women', 'fashion-women', '👗', 'Women''s fashion', 92, (SELECT id FROM categories WHERE slug = 'fashion')),
('Kids', 'fashion-kids', '👶', 'Kids fashion', 93, (SELECT id FROM categories WHERE slug = 'fashion'))
ON CONFLICT (slug) DO NOTHING;

-- Pets subcategories
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('Fishes & Aquarium', 'pets-fishes-aquarium', '🐠', 'Fish and aquarium supplies', 101, (SELECT id FROM categories WHERE slug = 'pets')),
('Pet Food & Accessories', 'pets-food-accessories', '🦴', 'Pet food and accessories', 102, (SELECT id FROM categories WHERE slug = 'pets')),
('Dogs', 'pets-dogs', '🐕', 'Dogs and dog supplies', 103, (SELECT id FROM categories WHERE slug = 'pets')),
('Other Pets', 'pets-other', '🐾', 'Other pets', 104, (SELECT id FROM categories WHERE slug = 'pets'))
ON CONFLICT (slug) DO NOTHING;

-- Books, Sports & Hobbies subcategories
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('Books', 'books-sports-books', '📖', 'Books and magazines', 111, (SELECT id FROM categories WHERE slug = 'books-sports-hobbies')),
('Gym & Fitness', 'books-sports-gym-fitness', '🏋️', 'Gym and fitness equipment', 112, (SELECT id FROM categories WHERE slug = 'books-sports-hobbies')),
('Musical Instruments', 'books-sports-musical-instruments', '🎸', 'Musical instruments', 113, (SELECT id FROM categories WHERE slug = 'books-sports-hobbies')),
('Sports Equipment', 'books-sports-equipment', '⚽', 'Sports equipment and gear', 114, (SELECT id FROM categories WHERE slug = 'books-sports-hobbies')),
('Other Hobbies', 'books-sports-other-hobbies', '🎨', 'Other hobby items', 115, (SELECT id FROM categories WHERE slug = 'books-sports-hobbies'))
ON CONFLICT (slug) DO NOTHING;

-- Services subcategories
INSERT INTO categories (name, slug, icon, description, display_order, parent_id) VALUES
('Education & Classes', 'services-education-classes', '🎓', 'Education and training classes', 121, (SELECT id FROM categories WHERE slug = 'services')),
('Tours & Travel', 'services-tours-travel', '✈️', 'Tours and travel services', 122, (SELECT id FROM categories WHERE slug = 'services')),
('Electronics Repair & Services', 'services-electronics-repair', '🔧', 'Electronics repair services', 123, (SELECT id FROM categories WHERE slug = 'services')),
('Health & Beauty', 'services-health-beauty', '💆', 'Health and beauty services', 124, (SELECT id FROM categories WHERE slug = 'services')),
('Home Renovation & Repair', 'services-home-renovation', '🏗️', 'Home renovation and repair', 125, (SELECT id FROM categories WHERE slug = 'services')),
('Cleaning & Pest Control', 'services-cleaning-pest-control', '🧹', 'Cleaning and pest control', 126, (SELECT id FROM categories WHERE slug = 'services')),
('Legal & Documentation Services', 'services-legal-documentation', '⚖️', 'Legal and documentation services', 127, (SELECT id FROM categories WHERE slug = 'services')),
('Packers & Movers', 'services-packers-movers', '📦', 'Packing and moving services', 128, (SELECT id FROM categories WHERE slug = 'services')),
('Other Services', 'services-other', '🛠️', 'Other services', 129, (SELECT id FROM categories WHERE slug = 'services'))
ON CONFLICT (slug) DO NOTHING;
