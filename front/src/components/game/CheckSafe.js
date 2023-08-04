import React, { Component } from 'react';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/selfie_segmentation';




async function convertBlobToImageData(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function () {
            const dataURL = reader.result;
            const img = new Image();
            img.onload = function () {
                resolve(img);
            };
            img.src = dataURL;
        };
        reader.readAsDataURL(blob);
    });
}

async function imageBitmapToImageData(imageBitmap) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    
    context.drawImage(imageBitmap, 0, 0);
    return context.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
  }
  

class Check extends Component {
    constructor(props) {
        super(props);
        this.state = {
            maxWidth: '100%',
            people: null, // 세그멘테이션 결과를 저장할 상태 변수
        };
    }

    
    async componentDidMount() {
        // body-segmentation 관련 코드 실행
        const checkImage = new Image();
        checkImage.src = require('../../assets/images/test_sample.png');
        await checkImage.decode();
        // Canvas를 생성하여 이미지를 그립니다
        const canvas = document.createElement('canvas');
        canvas.width = checkImage.width;
        canvas.height = checkImage.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(checkImage, 0, 0);
        
        // Canvas에서 ImageData를 추출합니다
        const checkImageData = ctx.getImageData(0, 0, checkImage.width, checkImage.height);

        const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
        const segmenterConfig = {
          runtime: 'mediapipe',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation'
                        // or 'base/node_modules/@mediapipe/selfie_segmentation' in npm.
        };
        const segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
        const segmentationConfig = { flipHorizontal: true };
    
        // props로 전달받은 이미지 블롭을 이미지 데이터로 변환하여 사용
        const imageElement = await convertBlobToImageData(this.props.image);
        const people = await segmenter.segmentPeople(imageElement, segmentationConfig);
        
        this.setState({
            people: people,
            checkImageData: checkImageData,
        });
    }

    render() {
        const { people, checkImageData } = this.state;
    
        if (!people || people.length === 0) {
            return null; // 세그멘테이션 결과가 없으면 아무것도 렌더링하지 않음
        }

        // 이미지 데이터 뒤집기
        const maskImageData = people[0].mask.mask;
        console.log(maskImageData)
        
        // const flippedImageData = new ImageData(maskImageData.width, maskImageData.height);
    
        // for (let y = 0; y < maskImageData.height; y++) {
        //     for (let x = 0; x < maskImageData.width; x++) {
        //         const sourceIndex = (y * maskImageData.width + (maskImageData.width - 1 - x)) * 4;
        //         const targetIndex = (y * maskImageData.width + x) * 4;
    
        //         flippedImageData.data[targetIndex] = maskImageData.data[sourceIndex];
        //         flippedImageData.data[targetIndex + 1] = maskImageData.data[sourceIndex + 1];
        //         flippedImageData.data[targetIndex + 2] = maskImageData.data[sourceIndex + 2];
        //         flippedImageData.data[targetIndex + 3] = maskImageData.data[sourceIndex + 3];
        //     }
        // }
        console.log('샘플 이미지', checkImageData)
        console.log('마스크데이터', maskImageData)
        return (
            <div className="check-container">
                <div style={{ overflowX: 'auto' }}>
                <canvas
                    ref={canvasRef => {
                        if (canvasRef) {
                            const ctx = canvasRef.getContext('2d');

                            // Canvas의 크기를 이미지 데이터 크기에 맞게 설정
                            canvasRef.width = maskImageData.width;
                            canvasRef.height = maskImageData.height;

                            // ImageBitmap을 ImageData로 변환
                            imageBitmapToImageData(maskImageData).then(imageData => {
                                // 이미지 데이터를 캔버스에 그립니다
                                ctx.putImageData(imageData, 0, 0);
                            });
                        }
                    }}
                />
                </div>
            </div>
        );
    }
    
}

export default Check;


// import React, { Component } from 'react';

// class ImagePixelCheckComponent extends Component {
//     constructor(props) {
//         super(props);

//         this.state = {
//             imageLoaded: false,
//             pixelCoordinates: [
//                 { x: 100, y: 100 },
//                 { x: 150, y: 200 },
//                 // ... Add more pixel coordinates
//             ],
//             pixelResults: [],
//         };

//         this.imageRef = React.createRef();
//     }

//     componentDidMount() {
//         this.loadImage();
//     }

//     loadImage() {
//         const image = new Image();
//         image.src = '/path/to/your/image.png'; // Replace with your image path

//         image.onload = () => {
//             this.imageRef.current.width = image.width;
//             this.imageRef.current.height = image.height;

//             this.setState({
//                 imageLoaded: true,
//             });

//             this.checkPixelCoordinates(image);
//         };
//     }

//     checkPixelCoordinates(image) {
//         const { pixelCoordinates } = this.state;
//         const canvas = document.createElement('canvas');
//         const context = canvas.getContext('2d');

//         canvas.width = image.width;
//         canvas.height = image.height;

//         context.drawImage(image, 0, 0, image.width, image.height);

//         const pixelResults = pixelCoordinates.map((coord) => {
//             const pixelData = context.getImageData(coord.x, coord.y, 1, 1).data;
//             const isColoredPixel = pixelData[3] !== 0; // Check if alpha value is not 0

//             return {
//                 ...coord,
//                 isColoredPixel,
//             };
//         });

//         this.setState({
//             pixelResults,
//         });
//     }

//     render() {
//         const { imageLoaded, pixelResults } = this.state;

//         return (
//             <div>
//                 <h1>Image Pixel Check</h1>
//                 {imageLoaded ? (
//                     <div>
//                         <div>
//                             <img
//                                 ref={this.imageRef}
//                                 src="/path/to/your/image.png"
//                                 alt="Target Image"
//                             />
//                         </div>
//                         <div>
//                             <h2>Pixel Results</h2>
//                             <ul>
//                                 {pixelResults.map((result, index) => (
//                                     <li key={index}>
//                                         {`Pixel (${result.x}, ${result.y}): ${
//                                             result.isColoredPixel ? 'Colored' : 'Transparent'
//                                         }`}
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     </div>
//                 ) : (
//                     <p>Loading image...</p>
//                 )}
//             </div>
//         );
//     }
// }

// export default ImagePixelCheckComponent;