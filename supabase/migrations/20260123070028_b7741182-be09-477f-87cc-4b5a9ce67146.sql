-- Add sold tracking columns to storefront_grails
ALTER TABLE storefront_grails 
ADD COLUMN is_sold boolean DEFAULT false,
ADD COLUMN sold_price numeric DEFAULT NULL;