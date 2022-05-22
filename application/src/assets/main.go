package main

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/nfnt/resize"
)

func toBase64(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}

func main() {
	ARGS := os.Args[1:]
	path := ARGS[0]
	width, err := strconv.ParseUint(ARGS[1], 10, 64)
	if err != nil {
		log.Fatal(err)
	}

	data := resizeImage(path, uint(width))

	var base64Encoding string

	mimeType := http.DetectContentType(data)

	switch mimeType {
	case "image/jpeg":
		base64Encoding += "data:image/jpeg;base64,"
	case "image/png":
		base64Encoding += "data:image/png;base64,"
	}

	base64Encoding += toBase64(data)

	fmt.Println(base64Encoding)
}

func resizeImage(path string, width uint) []byte {
	input, _ := os.Open(path)
	defer input.Close()

	rdr := bufio.NewReader(input)
	bts, _ := rdr.Peek(512)
	mimeType := http.DetectContentType(bts)

	loadedImage, _ := os.Open(path)
	defer input.Close()

	var image image.Image
	var err error
	switch mimeType {
	case "image/jpeg":
		image, err = jpeg.Decode(loadedImage)
	case "image/png":
		image, err = png.Decode(loadedImage)
	}

	if err != nil {
		log.Fatal(err)
	}

	newImage := resize.Resize(width, 0, image, resize.Lanczos3)

	buf := new(bytes.Buffer)
	err = jpeg.Encode(buf, newImage, nil)
	if err != nil {
		log.Fatal(err)
	}

	return buf.Bytes()
}
