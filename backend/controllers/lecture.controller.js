const db = require('../models');
const Heading = db.Heading;
const Subheading = db.Subheading;
const Lecture = db.Lecture;
const path = require('path');
const fs = require('fs');

// Get all lectures grouped by headings and subheadings
exports.getLecturesByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const headings = await Heading.findAll({
      where: { courseId },
      order: [['createdAt', 'ASC']], // Order headings by creation date (oldest first)
      include: [
        {
          model: Subheading,
          as: 'subheadings',
          order: [['createdAt', 'ASC']], // Order subheadings by creation date (oldest first)
          include: [
            {
              model: Lecture,
              as: 'lectures',
              order: [['createdAt', 'ASC']], // Order lectures by creation date (oldest first)
            },
          ],
          separate: true, // Needed to apply the order at the subheading level
        },
      ],
      separate: true, // Needed to apply the order at the heading level
    });

    const result = headings.map((heading) => ({
      heading: heading.title,
      subheadings: heading.subheadings.map((subheading) => ({
        subheading: subheading.title,
        lectures: subheading.lectures
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sort lectures by creation date (oldest first)
          .map((lecture) => {
            // Add debug logging
            console.log(`Processing lecture [${lecture.id}]: ${lecture.lectureTitle}`);
            console.log(`PDF paths stored: ${lecture.pdfPaths}`);
            
            let fileUrls = [];
            try {
              const paths = JSON.parse(lecture.pdfPaths || '[]');
              console.log(`Parsed paths for lecture ${lecture.id}:`, paths);
              
              fileUrls = paths.map((filePath) => ({
                url: `${req.protocol}://${req.get('host')}/${filePath}`,
                name: path.basename(filePath),
                type: path.extname(filePath).toLowerCase(), // Generalized for all file types
              }));
            } catch (error) {
              console.error(`Error parsing PDF paths for lecture ${lecture.id}:`, error);
              fileUrls = [];
            }
            
            return {
              ...lecture.dataValues,
              fileUrls,
            };
          })
      }))
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching lectures:', error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while retrieving lectures',
    });
  }
};

// Get a specific lecture
exports.getLecture = async (req, res) => {
  try {
    const { id: lectureId, courseId } = req.params;

    const lecture = await Lecture.findOne({
      where: { id: lectureId, courseId }
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    const lectureWithFiles = {
      ...lecture.dataValues,
      fileUrls: JSON.parse(lecture.pdfPaths || '[]').map((filePath) => ({
        url: `${req.protocol}://${req.get('host')}/${filePath}`,
        name: path.basename(filePath),
        type: path.extname(filePath).toLowerCase(), // Generalized for all file types
      })),
    };

    res.status(200).json({
      success: true,
      data: lectureWithFiles
    });
  } catch (error) {
    console.error('Error fetching lecture:', error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while retrieving the lecture'
    });
  }
};

// Create a new lecture
exports.createLecture = async (req, res) => {
  try {
    const { heading, subheading, lectureTitle, lectureDescription, youtubeLink, courseId } = req.body;
    const filePaths = req.files ? req.files.map((file) => path.join('uploads', file.filename)) : []; // Generalized for all file types

    // First find the heading by title
    const headingRecord = await Heading.findOne({
      where: { title: heading, courseId }
    });

    if (!headingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Heading not found',
      });
    }

    // Then find the subheading by title and heading ID
    const subheadingRecord = await Subheading.findOne({
      where: { title: subheading, headingId: headingRecord.id }
    });

    if (!subheadingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Subheading not found',
      });
    }

    const lecture = await Lecture.create({
      subheadingId: subheadingRecord.id,
      lectureTitle,
      lectureDescription,
      youtubeLink,
      pdfPaths: JSON.stringify(filePaths), // Save file paths as JSON
    });

    res.status(201).json({
      success: true,
      message: 'Lecture created successfully',
      data: lecture,
    });
  } catch (error) {
    console.error('Error creating lecture:', error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while creating the lecture',
    });
  }
};

// Create a new heading
exports.createHeading = async (req, res) => {
  try {
    const { courseId, heading, subheading } = req.body;
    
    console.log("Create Heading Request:", { courseId, heading, subheading });

    if (!courseId || !heading) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and heading are required',
      });
    }

    // Check if heading already exists
    const existingHeading = await Heading.findOne({
      where: { courseId, title: heading }
    });

    let headingRecord;
    
    if (existingHeading) {
      headingRecord = existingHeading;
      console.log("Using existing heading:", existingHeading.id);
    } else {
      // Create the heading first
      headingRecord = await Heading.create({ courseId, title: heading });
      console.log("Created new heading with ID:", headingRecord.id);
    }

    // Create the subheading only if provided
    let newSubheading = null;
    if (subheading) {
      newSubheading = await Subheading.create({ 
        headingId: headingRecord.id, 
        title: subheading 
      });
      console.log("Created new subheading with ID:", newSubheading.id);
    }

    res.status(201).json({
      success: true,
      message: 'Heading created successfully',
      data: {
        heading: headingRecord,
        subheading: newSubheading
      }
    });
  } catch (error) {
    console.error('Error creating heading:', error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while creating the heading: ' + error.message,
    });
  }
};

// Create a new subheading
exports.createSubheading = async (req, res) => {
  try {
    const { courseId, heading, subheading } = req.body;

    if (!courseId || !heading || !subheading) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, heading, and subheading are required',
      });
    }

    // Find the heading by title and courseId
    const headingRecord = await Heading.findOne({
      where: { title: heading, courseId }
    });

    if (!headingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Heading not found',
      });
    }

    const newSubheading = await Subheading.create({ 
      headingId: headingRecord.id,
      title: subheading 
    });

    res.status(201).json({
      success: true,
      message: 'Subheading created successfully',
      data: newSubheading,
    });
  } catch (error) {
    console.error('Error creating subheading:', error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while creating the subheading',
    });
  }
};

// Edit a subheading
exports.editSubheading = async (req, res) => {
  console.log('Edit Subheading Request Received:', req.body);
  try {
    const { courseId } = req.params;
    const { currentSubheading, newSubheading, heading } = req.body;

    if (!currentSubheading || !newSubheading || !heading) {
      return res.status(400).json({
        success: false,
        message: 'Current subheading, new subheading, and heading are required'
      });
    }

    // Find the heading first
    const headingRecord = await Heading.findOne({
      where: { courseId, title: heading }
    });

    if (!headingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Heading not found'
      });
    }

    // Find the subheading to update
    const subheading = await Subheading.findOne({
      where: { headingId: headingRecord.id, title: currentSubheading }
    });

    if (!subheading) {
      return res.status(404).json({
        success: false,
        message: 'Subheading not found'
      });
    }

    // Update the subheading
    await subheading.update({ title: newSubheading });

    res.status(200).json({
      success: true,
      message: 'Subheading updated successfully',
      data: subheading
    });
  } catch (error) {
    console.error('Error updating subheading:', error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while updating the subheading'
    });
  }
};

// Update a lecture
exports.updateLecture = async (req, res) => {
  try {
    const { courseId, id: lectureId } = req.params;
    const { lectureTitle, lectureDescription, youtubeLink, heading, subheading, filesToDelete } = req.body;
    const newFilePaths = req.files ? req.files.map((file) => path.join('uploads', file.filename)) : []; // Generalized for all file types

    console.log('Update lecture request received:');
    console.log('Files:', req.files ? req.files.length : 0);
    console.log('New file paths:', newFilePaths);
    
    // Parse filesToDelete if provided
    let filesToDeleteArray = [];
    if (filesToDelete) {
      try {
        filesToDeleteArray = JSON.parse(filesToDelete);
        console.log('Files to delete:', filesToDeleteArray);
      } catch (parseError) {
        console.error('Error parsing filesToDelete:', parseError);
      }
    }

    const lecture = await Lecture.findByPk(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    console.log('Original lecture PDF paths:', lecture.pdfPaths);

    // If heading and subheading are provided, update the subheadingId association
    if (heading && subheading && courseId) {
      // Find the heading by title and courseId
      const headingRecord = await Heading.findOne({
        where: { title: heading, courseId }
      });

      if (!headingRecord) {
        return res.status(404).json({
          success: false,
          message: `Heading "${heading}" not found for course ${courseId}`,
        });
      }

      console.log("Found heading:", headingRecord.id);

      // Find the subheading by title and headingId
      const subheadingRecord = await Subheading.findOne({
        where: { title: subheading, headingId: headingRecord.id }
      });

      if (!subheadingRecord) {
        return res.status(404).json({
          success: false,
          message: `Subheading "${subheading}" not found under heading "${heading}"`,
        });
      }

      console.log("Found subheading:", subheadingRecord.id);

      // Update the subheadingId
      await lecture.update({ subheadingId: subheadingRecord.id });
    }

    // Handle file paths and deletions properly
    let updatedFilePaths = [];
    
    try {
      // Only try to parse if lecture.pdfPaths exists and is not null
      if (lecture.pdfPaths && lecture.pdfPaths !== 'null') {
        const existingFilePaths = JSON.parse(lecture.pdfPaths);
        console.log('Existing file paths parsed successfully:', existingFilePaths);
        
        // Process file deletions if any
        if (filesToDeleteArray.length > 0) {
          // Extract just the filename from the full URLs provided in filesToDeleteArray
          const filenamesToDelete = filesToDeleteArray.map(url => {
            try {
              // Get just the filename from the URL
              return path.basename(url);
            } catch (e) {
              console.error('Error extracting filename from URL:', e);
              return null;
            }
          }).filter(Boolean);
          
          console.log('Filenames to delete:', filenamesToDelete);
          
          // Filter out paths that are marked for deletion
          updatedFilePaths = existingFilePaths.filter(filePath => {
            // Extract filename from the path
            const filename = path.basename(filePath);
            const shouldKeep = !filenamesToDelete.includes(filename);
            
            if (!shouldKeep) {
              // Delete the physical file if it should not be kept
              try {
                const absolutePath = path.resolve(filePath);
                console.log(`Attempting to delete file at: ${absolutePath}`);
                if (fs.existsSync(absolutePath)) {
                  fs.unlinkSync(absolutePath);
                  console.log(`Deleted file: ${absolutePath}`);
                } else {
                  console.log(`File does not exist at: ${absolutePath}`);
                }
              } catch (fileError) {
                console.error(`Error deleting file ${filePath}:`, fileError);
              }
            }
            return shouldKeep;
          });
        } else {
          // No files to delete, keep all existing paths
          updatedFilePaths = [...existingFilePaths];
        }
        
        // Add new file paths
        updatedFilePaths = [...updatedFilePaths, ...newFilePaths];
      } else {
        console.log('No existing file paths or null value found');
        updatedFilePaths = [...newFilePaths];
      }
    } catch (parseError) {
      console.error('Error parsing existing PDF paths:', parseError);
      console.log('Setting updatedFilePaths to new files only');
      updatedFilePaths = [...newFilePaths];
    }
    
    console.log('Final updated file paths:', updatedFilePaths);
    
    // Update the lecture with all the information
    await lecture.update({
      lectureTitle: lectureTitle || lecture.lectureTitle,
      lectureDescription: lectureDescription || lecture.lectureDescription,
      youtubeLink: youtubeLink || lecture.youtubeLink,
      pdfPaths: JSON.stringify(updatedFilePaths), // Save updated file paths
    });

    // Generate file URLs for response
    const fileUrls = updatedFilePaths.map((filePath) => ({
      url: `${req.protocol}://${req.get('host')}/${filePath}`,
      name: path.basename(filePath),
      type: path.extname(filePath).toLowerCase(), // Generalized for all file types
    }));

    console.log('Generated file URLs for response:', fileUrls);

    res.status(200).json({
      success: true,
      message: 'Lecture updated successfully',
      data: {
        ...lecture.dataValues,
        fileUrls,
      },
    });
  } catch (error) {
    console.error('Error updating lecture:', error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while updating the lecture: ' + error.message,
    });
  }
};

// Delete a lecture
exports.deleteLecture = async (req, res) => {
  try {
    const { id: lectureId } = req.params;

    const lecture = await Lecture.findByPk(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    const pdfPaths = JSON.parse(lecture.pdfPaths || '[]');
    pdfPaths.forEach((filePath) => {
      const absolutePath = path.resolve(filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath); // Generalized for all file types
      }
    });

    await lecture.destroy();

    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while deleting the lecture',
    });
  }
};

// Delete a subheading and all its lectures
exports.deleteSubheading = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { heading, subheading } = req.body;

    if (!heading || !subheading) {
      return res.status(400).json({
        success: false,
        message: 'Heading and subheading are required',
      });
    }

    // Find the heading first
    const headingRecord = await Heading.findOne({
      where: { courseId, title: heading }
    });

    if (!headingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Heading not found',
      });
    }

    // Find the subheading
    const subheadingRecord = await Subheading.findOne({
      where: { headingId: headingRecord.id, title: subheading },
      include: [
        {
          model: Lecture,
          as: 'lectures'
        }
      ]
    });

    if (!subheadingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Subheading not found',
      });
    }

    // Delete all associated PDF files
    const lectures = subheadingRecord.lectures;
    if (lectures && lectures.length > 0) {
      lectures.forEach(lecture => {
        try {
          const pdfPaths = JSON.parse(lecture.pdfPaths || '[]');
          pdfPaths.forEach(filePath => {
            const absolutePath = path.resolve(filePath);
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath); // Generalized for all file types
            }
          });
        } catch (parseError) {
          console.error('Error parsing PDF paths:', parseError);
        }
      });
    }

    // Delete the subheading (cascade will delete associated lectures)
    await subheadingRecord.destroy();

    res.status(200).json({
      success: true,
      message: 'Subheading and associated lectures deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subheading:', error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while deleting the subheading',
    });
  }
};

// Delete a heading and all its subheadings and lectures
exports.deleteHeading = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { heading } = req.body;

    if (!heading) {
      return res.status(400).json({
        success: false,
        message: 'Heading name is required',
      });
    }

    // Find the heading first
    const headingRecord = await Heading.findOne({
      where: { courseId, title: heading },
      include: [
        {
          model: Subheading,
          as: 'subheadings',
          include: [
            {
              model: Lecture,
              as: 'lectures'
            }
          ]
        }
      ]
    });

    if (!headingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Heading not found',
      });
    }

    // Delete all associated PDF files
    const subheadings = headingRecord.subheadings;
    if (subheadings && subheadings.length > 0) {
      for (const subheading of subheadings) {
        const lectures = subheading.lectures;
        if (lectures && lectures.length > 0) {
          for (const lecture of lectures) {
            try {
              const pdfPaths = JSON.parse(lecture.pdfPaths || '[]');
              for (const filePath of pdfPaths) {
                const absolutePath = path.resolve(filePath);
                if (fs.existsSync(absolutePath)) {
                  fs.unlinkSync(absolutePath); // Delete the file from storage
                }
              }
            } catch (parseError) {
              console.error('Error parsing PDF paths:', parseError);
            }
          }
        }
      }
    }

    // Delete the heading (cascade will delete associated subheadings and lectures)
    await headingRecord.destroy();

    res.status(200).json({
      success: true,
      message: 'Module and all associated content deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting heading:', error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred while deleting the module',
    });
  }
};