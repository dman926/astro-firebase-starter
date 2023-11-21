const imageWithOnloadstartRegex = /<img[^>]+onload[^>]*>/i;
/**
 * Checks if the given string contains an *img* tag with an *onload* attribute.
 * Returns true if the string is "safe".
 * This should never be an issue as the editor doesn't allow images
  
 * @see {@link https://github.com/advisories/GHSA-4943-9vgg-gr5r|GitHub Advisory Database CVE-2021-3163}
 * 
 * @param {string} toBeTestedForImgWithOnload - The string to be tested for an image tag with an onload attribute.
 * @return {boolean} Returns true if the string does not contain an *img* tag with an *onload* attribute.
 */
export const CVE_2021_3163_check = (
  toBeTestedForImgWithOnload: string,
): boolean => {
  return !imageWithOnloadstartRegex.test(toBeTestedForImgWithOnload);
};
