'''
Create face embeddings for all the faces in the dataset/train directory
'''

import encodings
import pickle
from imutils import paths
import cv2
import face_recognition
import os
from parameters import DLIB_FACE_ENCODING_PATH, DATASET_PATH

def create_face_embeddings():
    '''
    This function creates face encodings for all the faces in the dataset/train directory
    '''
    imagePaths = list(paths.list_images(DATASET_PATH))
    print(imagePaths)

    # initialize the list of known encodings and known names
    knownEncodings = []
    knownNames = []

    # loop over the image paths
    for (i, imagePath) in enumerate(imagePaths):
        # extract the person name from the image path
        print("[INFO] processing image {}/{}".format(i + 1, len(imagePaths)))
        name = imagePath.split(os.path.sep)[-2]
        print(name)
        # load the input image and convert it from BGR (OpenCV ordering)
        # to dlib ordering (RGB)
        image = cv2.imread(imagePath)
        encodings = face_recognition.face_encodings(image, num_jitters=10, model='large')

        if len(encodings) == 0:
            print("[WARNING] No face found in:", imagePath)
            continue

        encoding = encodings[0]
        knownEncodings.append(encoding)
        knownNames.append(name)
         
    # dump the facial encodings + names to disk
    print("[INFO] serializing encodings...")
    data = {"encodings": knownEncodings, "names": knownNames}
    f = open(DLIB_FACE_ENCODING_PATH, "wb")
    f.write(pickle.dumps(data))
    f.close()

if __name__ == '__main__':
    create_face_embeddings()
