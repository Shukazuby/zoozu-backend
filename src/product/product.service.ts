import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from '../schemas/product.entity';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO, IPaginationFilter } from 'src/utils';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Helper function to parse array fields from multipart/form-data
   * Arrays can come as: JSON string, comma-separated string, or actual array
   */
  private parseArrayField(value: any): string[] {
    if (!value) return [];
    
    // If already an array, return it
    if (Array.isArray(value)) {
      return value.filter(item => item && item.trim() !== '');
    }
    
    // If string, try to parse
    if (typeof value === 'string') {
      // Try JSON parse first
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && item.trim() !== '');
        }
      } catch {
        // Not JSON, try comma-separated
        if (value.includes(',')) {
          return value.split(',').map(item => item.trim()).filter(item => item !== '');
        }
        // Single value
        return value.trim() ? [value.trim()] : [];
      }
    }
    
    return [];
  }

  async create(
    dto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    // Parse all array fields properly
    const imagesArray = this.parseArrayField(dto.images);
    const categoriesArray = this.parseArrayField(dto.categories);
    const sizesArray = this.parseArrayField(dto.sizes);
    const colorsArray = this.parseArrayField(dto.colors);

    const product = new this.productModel({
      ...dto,
      images: imagesArray,
      categories: categoriesArray,
      sizes: sizesArray,
      colors: colorsArray,
    });

    // If a file is uploaded, add it to the images array
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      if (!product.images || product.images.length === 0) {
        product.images = [uploadResult.url];
      } else {
        product.images.push(uploadResult.url);
      }
    }

    // Ensure all array fields are arrays before saving
    product.images = Array.isArray(product.images) ? product.images : [];
    product.categories = Array.isArray(product.categories) ? product.categories : [];
    product.sizes = Array.isArray(product.sizes) ? product.sizes : [];
    product.colors = Array.isArray(product.colors) ? product.colors : [];

    return product.save();
  }

  async update(
    productId: string,
    payload: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<BaseResponseTypeDTO> {
    try {
      const product = await this.productModel.findOne({ _id: productId });

      if (!product) {
        throw new NotFoundException(
          `Product not found, therefore cannot be updated.`,
        );
      }

      if ('name' in payload) {
        product.name = payload.name;
      }

      if ('price' in payload) {
        product.price = typeof payload.price === 'string' ? parseFloat(payload.price) : payload.price;
      }

      if ('description' in payload) {
        product.description = payload.description;
      }

      // Parse all array fields properly
      if ('images' in payload && payload.images !== undefined) {
        product.images = this.parseArrayField(payload.images);
      }
      if ('categories' in payload && payload.categories !== undefined) {
        product.categories = this.parseArrayField(payload.categories);
      }
      if ('sizes' in payload && payload.sizes !== undefined) {
        product.sizes = this.parseArrayField(payload.sizes);
      }
      if ('colors' in payload && payload.colors !== undefined) {
        product.colors = this.parseArrayField(payload.colors);
      }

      if ('isNew' in payload) {
        const isNewValue = payload.isNew;
        product.isNew = typeof isNewValue === 'string' ? isNewValue === 'true' : Boolean(isNewValue);
      }

      if ('isFeatured' in payload) {
        const isFeaturedValue = payload.isFeatured;
        product.isFeatured = typeof isFeaturedValue === 'string' ? isFeaturedValue === 'true' : Boolean(isFeaturedValue);
      }

      if ('isAvailable' in payload) {
        const isAvailableValue = payload.isAvailable;
        product.isAvailable = typeof isAvailableValue === 'string' ? isAvailableValue === 'true' : Boolean(isAvailableValue);
      }

      if ('isBespoke' in payload) {
        const isBespokeValue = payload.isBespoke;
        product.isBespoke = typeof isBespokeValue === 'string' ? isBespokeValue === 'true' : Boolean(isBespokeValue);
      }

      if ('isPreOrder' in payload) {
        const isPreOrderValue = payload.isPreOrder;
        product.isPreOrder = typeof isPreOrderValue === 'string' ? isPreOrderValue === 'true' : Boolean(isPreOrderValue);
      }

      if ('isActive' in payload) {
        const isActiveValue = payload.isActive;
        product.isActive = typeof isActiveValue === 'string' ? isActiveValue === 'true' : Boolean(isActiveValue);
      }

      if ('gender' in payload) {
        product.gender = payload.gender;
      }

      if ('stock' in payload) {
        product.stock = typeof payload.stock === 'string' ? parseInt(payload.stock, 10) : payload.stock;
      }

      if ('badge' in payload) {
        product.badge = payload.badge;
      }

      if ('tag' in payload) {
        product.tag = payload.tag;
      }

      // If a file is uploaded, add it to the images array
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        if (!product.images || product.images.length === 0) {
          product.images = [uploadResult.url];
        } else {
          product.images.push(uploadResult.url);
        }
      }

      // Ensure images is always an array before saving
      if (!product.images || !Array.isArray(product.images)) {
        product.images = [];
      }

      const updatedProduct = await product.save();

      return {
        data: updatedProduct,
        success: true,
        code: HttpStatus.OK,
        message: 'Product updated successfully',
      };
    } catch (ex) {
      throw ex;
    }
  }

  async findAllProducts(
    filters: IPaginationFilter & { productType?: string },
  ): Promise<BaseResponseTypeDTO> {
    try {
      const searchFilter: any = {};
      if (filters.search) {
        const searchTerm = filters.search.trim();
        const userFields = Object.keys(this.productModel.schema.obj);

        searchFilter.$or = userFields
          .map((field) => {
            const fieldType = this.productModel.schema.obj[field]?.type;
            if (fieldType === String) {
              return {
                [field]: { $regex: searchTerm, $options: 'i' },
              };
            }
            return {};
          })
          .filter((condition) => Object.keys(condition).length > 0);
      }

      if (filters.productType === 'general') {
        searchFilter.productType = 'general';
      }

      if (filters.productType === 'mealprep') {
        searchFilter.productType = 'mealprep';
      }

      const limit = filters.limit || 100;
      const page = filters.page || 1;
      const skip = (page - 1) * limit;

      const totalCount = await this.productModel.countDocuments(searchFilter);

      const data = await this.productModel
        .find(searchFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      if (!data || data.length === 0) {
        return {
          data: [],
          success: true,
          code: HttpStatus.OK,
          message: 'Products Not Found',
          limit,
          page,
          search: filters?.search,
        };
      }

      return {
        data: {
          totalCount,
          data,
        },
        success: true,
        code: HttpStatus.OK,
        message: 'All Products Found',
        limit: filters.limit,
        page: filters.page,
        search: filters.search,
      };
    } catch (ex) {
      throw ex;
    }
  }

  async findByProductTypes(
    filters: IPaginationFilter & {
      gender?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      availability?: string;
      sortBy?: string;
      isActive?: boolean | string;
      isNew?: boolean | string;
      isFeatured?: boolean | string;
    },
    productType?: string,
  ): Promise<BaseResponseTypeDTO> {
    try {
      const searchFilter: any = {};

      // Filter by isActive (default to true if not specified)
      // Handle string to boolean conversion for query parameters
      if (filters.isActive !== undefined) {
        const isActiveValue = filters.isActive === 'true' || filters.isActive === true;
        searchFilter.isActive = isActiveValue;
      } else {
        searchFilter.isActive = true; // Default to active products
      }

      // Search across string fields
      if (filters.search) {
        const searchTerm = filters.search.trim();
        searchFilter.$or = [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { name: { $regex: searchTerm, $options: 'i' } },
        ];
      }

      // Filter by gender
      if (filters.gender) {
        searchFilter.gender = filters.gender;
      }

      // Filter by category
      if (filters.category && filters.category !== 'All') {
        searchFilter.$or = [
          { categories: { $in: [filters.category] } },
          { category: filters.category },
        ];
      }

      // Filter by price range
      if (filters.minPrice || filters.maxPrice) {
        searchFilter.price = {};
        if (filters.minPrice) {
          searchFilter.price.$gte = filters.minPrice;
        }
        if (filters.maxPrice) {
          searchFilter.price.$lte = filters.maxPrice;
        }
      }

      // Filter by availability
      if (filters.availability === 'in-stock') {
        searchFilter.stock = { $gt: 0 };
        searchFilter.isAvailable = true;
      } else if (filters.availability === 'pre-order') {
        searchFilter.isPreOrder = true;
      } else if (filters.availability === 'bespoke') {
        searchFilter.isBespoke = true;
      }

      // Filter by productType if provided (backward compatibility)
      if (productType) {
        searchFilter.productType = productType;
      }

      // Filter by isNew
      // Handle string to boolean conversion for query parameters
      if (filters.isNew !== undefined) {
        const isNewValue = filters.isNew === 'true' || filters.isNew === true;
        searchFilter.isNew = isNewValue;
      }

      // Filter by isFeatured
      // Handle string to boolean conversion for query parameters
      if (filters.isFeatured !== undefined) {
        const isFeaturedValue = filters.isFeatured === 'true' || filters.isFeatured === true;
        searchFilter.isFeatured = isFeaturedValue;
      }

      const limit = filters.limit || 12;
      const page = filters.page || 1;
      const skip = (page - 1) * limit;

      // Sort options
      let sort: any = { createdAt: -1 };
      if (filters.sortBy === 'price-low') {
        sort = { price: 1 };
      } else if (filters.sortBy === 'price-high') {
        sort = { price: -1 };
      } else if (filters.sortBy === 'popular') {
        sort = { sales: -1 };
      } else if (filters.sortBy === 'name') {
        sort = { title: 1 };
      }

      const totalCount = await this.productModel.countDocuments(searchFilter);

      const data = await this.productModel
        .find(searchFilter)
        .skip(skip)
        .limit(limit)
        .sort(sort);

      if (!data || data.length === 0) {
        return {
          data: [],
          success: true,
          code: HttpStatus.OK,
          message: 'Products Not Found',
          limit,
          page,
          search: filters?.search,
          totalCount: 0,
        };
      }

      return {
          data,
        success: true,
        code: HttpStatus.OK,
        message: 'All Products Found',
        limit,
        page,
        search: filters.search,
        totalCount,
      };
    } catch (ex) {
      throw ex;
    }
  }

  async getAProduct(productId: string): Promise<BaseResponseTypeDTO> {
    try {
      const product = await this.productModel.findOne({ _id: productId, isActive: true });

      if (!product) {
        throw new NotFoundException(`Product not found.`);
      }

      // Increment views
      product.views += 1;
      await product.save();

      return {
        data: product,
        success: true,
        code: HttpStatus.OK,
        message: 'Product Fetched',
      };
    } catch (ex) {
      throw ex;
    }
  }

  async deleteProduct(productId: string): Promise<BaseResponseTypeDTO> {
    try {
      const product = await this.productModel.findOne({ _id: productId });

      if (!product) {
        throw new NotFoundException(`Product not found.`);
      }

      await this.productModel.findByIdAndDelete(productId);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Product Deleted',
      };
    } catch (ex) {
      throw ex;
    }
  }

  async updateProduct(
    productId: string,
    payload: UpdateProductDto,
  ): Promise<BaseResponseTypeDTO> {
    try {
      const record = await this.productModel.findOne({ _id: productId });

      if (!record) {
        throw new NotFoundException(
          `Product not found, therefore cannot be updated.`,
        );
      }

      if ('name' in payload) {
        record.name = payload.name;
      }


    if ('price' in payload) {
      record.price = payload.price;
    }

      if ('description' in payload) {
        record.description = payload.description;
      }

      // Parse all array fields properly
      if ('images' in payload && payload.images !== undefined) {
        record.images = this.parseArrayField(payload.images);
      }
      if ('categories' in payload && payload.categories !== undefined) {
        record.categories = this.parseArrayField(payload.categories);
      }
      if ('sizes' in payload && payload.sizes !== undefined) {
        record.sizes = this.parseArrayField(payload.sizes);
      }
      if ('colors' in payload && payload.colors !== undefined) {
        record.colors = this.parseArrayField(payload.colors);
      }

      // Ensure all array fields are arrays before saving
      record.images = Array.isArray(record.images) ? record.images : [];
      record.categories = Array.isArray(record.categories) ? record.categories : [];
      record.sizes = Array.isArray(record.sizes) ? record.sizes : [];
      record.colors = Array.isArray(record.colors) ? record.colors : [];

    if ('isNew' in payload) {
      record.isNew = payload.isNew;
    }

    if ('isFeatured' in payload) {
      record.isFeatured = payload.isFeatured;
    }

      const updatedProduct = await record.save();

      return {
        data: updatedProduct,
        success: true,
        code: HttpStatus.OK,
        message: 'Product Updated',
      };
    } catch (ex) {
      throw ex;
    }
  }


  async findFeatured(): Promise<BaseResponseTypeDTO> {
    const data = await this.productModel
      .find({ isFeatured: true, isActive: true })
      .limit(8)
      .sort({ createdAt: -1 });

    return {
      data,
      success: true,
      code: HttpStatus.OK,
      message: 'Featured products',
    };
  }

  async findNewArrivals(): Promise<BaseResponseTypeDTO> {
    const data = await this.productModel
      .find({ isNew: true, isActive: true })
      .limit(12)
      .sort({ createdAt: -1 });

    return {
      data,
      success: true,
      code: HttpStatus.OK,
      message: 'New arrivals',
    };
  }
}
