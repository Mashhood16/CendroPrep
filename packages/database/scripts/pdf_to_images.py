import sys
import fitz # PyMuPDF
import os

def pdf_to_images(pdf_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    print(f"Opening {pdf_path}...")
    doc = fitz.open(pdf_path)
    
    # Process the first 15 pages for MVP (Chapter 1 only)
    num_pages = min(15, len(doc))
    print(f"Rendering {num_pages} pages...")
    
    for i in range(num_pages):
        page = doc.load_page(i)
        # 2.0 zoom for better OCR resolution (approx 144 DPI)
        pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
        image_path = os.path.join(output_dir, f"page_{i+1}.png")
        pix.save(image_path)
        print(f"Saved {image_path}")
        
    print("Done rendering pages.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python pdf_to_images.py <pdf_path> <output_dir>")
        sys.exit(1)
        
    pdf_to_images(sys.argv[1], sys.argv[2])
