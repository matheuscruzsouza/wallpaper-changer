package main

// you need the image package, and a format package for encoding/decoding
import (
  "bytes"
  "image/jpeg"
  "image/png"
  "github.com/nfnt/resize"
  "encoding/base64"
	"fmt"
	"net/http"
  "os"
  "log"
)

func toBase64(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}

func main() {
  path := os.Args[1:]
	// Read the entire file into a byte slice
	data := resizeImage(path[0])

	var base64Encoding string

	// Determine the content type of the image file
	mimeType := http.DetectContentType(data)

	// Prepend the appropriate URI scheme header depending
	// on the MIME type
	switch mimeType {
	case "image/jpeg":
		base64Encoding += "data:image/jpeg;base64,"
	case "image/png":
		base64Encoding += "data:image/png;base64,"
	}

	// Append the base64 encoded output
	base64Encoding += toBase64(data)

	// Print the full base64 representation of the image
	fmt.Println(base64Encoding)
}

func resizeImage(path string) []byte {
  // Decoding gives you an Image.
  // If you have an io.Reader already, you can give that to Decode
  // without reading it into a []byte.
  input, _ := os.Open(path)
  defer input.Close()

  image, err := png.Decode(input)
  if err != nil {
		log.Fatal(err)
	}

  newImage := resize.Resize(300, 0, image, resize.Lanczos3)

  buf := new(bytes.Buffer)
  err = jpeg.Encode(buf, newImage, nil)
  if err != nil {
		log.Fatal(err)
	}

  return buf.Bytes()
}
