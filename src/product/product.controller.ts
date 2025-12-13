import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  PaginationFilterDTO,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseResponseTypeDTO } from 'src/utils';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}


  @Post('upload/img')
  @ApiOperation({ summary: 'Create a Product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'The Lagos Edit Senator Set' },
        price: { type: 'number', format: 'float', example: 85000 },
        description: { type: 'string', example: 'Premium breathable fabric with intricate placket embroidery.' },
        images: { type: 'array', items: { type: 'string' }, example: ['https://cloudinary.com/image1', 'https://cloudinary.com/image2'] },
        categories: { type: 'array', items: { type: 'string' }, example: ['Senator Sets', 'Ready-to-Wear'] },
        gender: { type: 'string', example: 'men', enum: ['men', 'women', 'unisex'] },
        sizes: { type: 'array', items: { type: 'string' }, example: ['S', 'M', 'L', 'XL'] },
        colors: { type: 'array', items: { type: 'string' }, example: ['#115e2a', '#0c4cb0'] },
        stock: { type: 'number', example: 10 },
        isAvailable: { type: 'boolean', example: true },
        isBespoke: { type: 'boolean', example: false },
        isPreOrder: { type: 'boolean', example: false },
        badge: { type: 'string', example: 'New Season' },
        tag: { type: 'string', example: 'Bespoke' },
        isNew: { type: 'boolean', example: false },
        isFeatured: { type: 'boolean', example: false },
        // image: {
        //   type: 'string',
        //   format: 'binary',
        //   description: 'Product image file',
        // },
      },
      required: ['name', 'price', 'description'],
    },
  })
  create(
    @Body() createPostDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Transform array fields from multipart/form-data
    // Arrays might come as strings, JSON strings, or comma-separated values
    const transformArrayField = (value: any): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [value];
        } catch {
          return value.includes(',') ? value.split(',').map(v => v.trim()).filter(v => v) : [value];
        }
      }
      return [];
    };

    const transformedDto: CreateProductDto = {
      ...createPostDto,
      images: transformArrayField(createPostDto.images),
      categories: transformArrayField(createPostDto.categories),
      sizes: transformArrayField(createPostDto.sizes),
      colors: transformArrayField(createPostDto.colors),
    };

    return this.productService.create(transformedDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Get all products' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'minPrice', type: Number, required: false })
  @ApiQuery({ name: 'maxPrice', type: Number, required: false })
  @ApiQuery({ name: 'availability', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  @ApiQuery({ name: 'isNew', type: Boolean, required: false })
  @ApiQuery({ name: 'isFeatured', type: Boolean, required: false })
  async findByProductTypes(
    @Query() filters: PaginationFilterDTO,
  ): Promise<BaseResponseTypeDTO> {
    const result = await this.productService.findByProductTypes(filters);
    return result;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by keyword' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Search results' })
  async search(@Query() filters: PaginationFilterDTO): Promise<BaseResponseTypeDTO> {
    return this.productService.findByProductTypes(filters);
  }

  @Get('featured/list')
  @ApiOperation({ summary: 'Frontend: get featured products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Featured products' })
  async featured(): Promise<BaseResponseTypeDTO> {
    return this.productService.findFeatured();
  }

  @Get('new-arrivals')
  @ApiOperation({ summary: 'Frontend: get new arrivals' })
  @ApiResponse({ status: HttpStatus.OK, description: 'New arrivals' })
  async newArrivals(): Promise<BaseResponseTypeDTO> {
    return this.productService.findNewArrivals();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by  Id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product fetched',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async getAProduct(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    const result = await this.productService.getAProduct(id);
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiBody({ type: UpdateProductDto })
  async updateProduct(
    @Param('id') id: string,
    @Body() payload: UpdateProductDto,
  ): Promise<BaseResponseTypeDTO> {
    const result = await this.productService.updateProduct(id, payload);
    return result;
  }

  @Patch(':id/product/image')
  @ApiOperation({ summary: 'Update a product with image' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'The Lagos Edit Senator Set' },
        name: { type: 'string', example: 'The Lagos Edit Senator Set' },
        price: { type: 'number', format: 'float', example: 85000 },
        amount: { type: 'number', format: 'float', example: 85000 },
        description: { type: 'string', example: 'Premium breathable fabric with intricate placket embroidery.' },
        images: { type: 'array', items: { type: 'string' }, example: ['https://cloudinary.com/image1'] },
        imageUrl: { type: 'string', example: 'https://cloudinary.com/image' },
        categories: { type: 'array', items: { type: 'string' }, example: ['Senator Sets'] },
        category: { type: 'string', example: 'Senator Sets' },
        gender: { type: 'string', example: 'men', enum: ['men', 'women', 'unisex'] },
        sizes: { type: 'array', items: { type: 'string' }, example: ['S', 'M', 'L', 'XL'] },
        colors: { type: 'array', items: { type: 'string' }, example: ['#115e2a', '#0c4cb0'] },
        stock: { type: 'number', example: 10 },
        isAvailable: { type: 'boolean', example: true },
        isBespoke: { type: 'boolean', example: false },
        isPreOrder: { type: 'boolean', example: false },
        badge: { type: 'string', example: 'New Season' },
        tag: { type: 'string', example: 'Bespoke' },
        isNew: { type: 'boolean', example: false },
        isFeatured: { type: 'boolean', example: false },
        isActive: { type: 'boolean', example: true },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Product image file',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() payload: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponseTypeDTO> {
    // Transform array fields from multipart/form-data
    const transformArrayField = (value: any): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [value];
        } catch {
          return value.includes(',') ? value.split(',').map(v => v.trim()).filter(v => v) : [value];
        }
      }
      return [];
    };

    const transformedPayload: UpdateProductDto = {
      ...payload,
      images: transformArrayField(payload.images),
      categories: transformArrayField(payload.categories),
      sizes: transformArrayField(payload.sizes),
      colors: transformArrayField(payload.colors),
    };

    const result = await this.productService.update(id, transformedPayload, file);
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete product with a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'product deleted',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async deleteProduct(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    const result = await this.productService.deleteProduct(id);
    return result;
  }
}
