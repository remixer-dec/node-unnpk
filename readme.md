## node-unnpk  

A Node JS port of [unnpk](https://github.com/YJBeetle/unnpk). Unpacks npk resources from netease games.  
    
    
**global installation**  
  
> npm install -g unnpk  


**usage**

> unnpk file.npk

or you just can clone github repo and run it

**local installation**  
  
> git clone https://github.com/remixer-dec/node-unnpk
> cd node-unnpk
> npm install 

**usage**

> node unnpk file.npk


This version is more manifest-related. The Manifest (or a file with all  filenames and offsets of npk archive) is usually obtained from a game's server.   
The manifest file needs to be placed in *manifest* folder with the same name and json extension. Run unnpk without arguments to see more info.  
If there is no manifest, this tool will try to guess a filename. Original unnpk project has better mime/format detection.   
  
If you want to use manifest and forced extension-detection, type anything in 3rd argument, e.g.

> node unnpk file.npk 1


