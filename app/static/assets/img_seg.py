import glob
import matplotlib.pyplot as plt
from skimage import util, io, filters, segmentation
from skimage.measure import regionprops, label

pad = 0

files = glob.glob('fire*.png')
for file in files:
    image = io.imread(file, True)
    h, w = image.shape       
    minrs, mincs, maxrs, maxcs = [],[],[],[] 

    val = filters.threshold_local(image, 201)

    # the mask object converts each pixel in the image to True or False
    # to indicate whether the given pixel is black/white
    mask = image <= val

    # labeled contains one integer for each pixel in the image,
    # where that image indicates the segment to which the pixel belongs
    labeled = label(mask)

    # for each segment number, find the area of the given segment.
    # If that area is sufficiently large, crop out the identified segment.
    regions = [region for region in regionprops(labeled) if region.area > 5000]

    for region in regions:
        grid = util.regular_grid(image.shape, n_points=6)
        plt.imshow(grid) #, cmap='gray')
        plt.show()            
    # bbox describes: min_row, min_col, max_row, max_col
    # minr, minc, maxr, maxc = region.bbox
    # minrs.append(minr)
    # mincs.append(minc)
    # maxrs.append(maxr)
    # maxcs.append(maxc)

    # print(sorted(minrs))
    # print(sorted(maxrs))
    # print(sorted(mincs))
    # print(sorted(maxcs))1
        #print (region.bbox)
        #final = image[minr-pad:maxr+pad, minc-pad:maxc+pad]

        # plot the resulting binarized image
        #plt.imshow(final, cmap='gray')
        #plt.show()