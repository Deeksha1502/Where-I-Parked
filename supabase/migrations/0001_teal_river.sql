/*
  # Parking Locations Schema

  1. New Tables
    - `parking_locations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `latitude` (double precision)
      - `longitude` (double precision)
      - `description` (text, optional)
      - `photo_url` (text, optional)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `parking_locations` table
    - Add policies for authenticated users to:
      - Read their own parking locations
      - Create/update their own parking locations
*/

CREATE TABLE parking_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  description text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE parking_locations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own parking locations
CREATE POLICY "Users can read own parking locations"
  ON parking_locations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own parking locations
CREATE POLICY "Users can insert own parking locations"
  ON parking_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own parking locations
CREATE POLICY "Users can update own parking locations"
  ON parking_locations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a storage bucket for parking photos
INSERT INTO storage.buckets (id, name)
VALUES ('parking-photos', 'parking-photos')
ON CONFLICT DO NOTHING;

-- Enable RLS for the storage bucket
CREATE POLICY "Authenticated users can upload parking photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'parking-photos');

-- Allow public access to parking photos
CREATE POLICY "Public access to parking photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'parking-photos');