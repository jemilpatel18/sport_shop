import { Brand } from '../models/Brand';
import { ApiError } from '../utils/apiError';
import { slugify } from '../utils/helpers';

export class BrandService {
  static async getBrands(activeOnly = true) {
    const query = activeOnly ? { status: 'active' } : {};
    const brands = await Brand.find(query).sort({ name: 1 });
    return brands.map((b) => b.toJSON());
  }

  static async getBrandByIdOrSlug(idOrSlug: string) {
    let brand;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      brand = await Brand.findById(idOrSlug);
    }
    if (!brand) {
      brand = await Brand.findOne({ slug: idOrSlug.toLowerCase() });
    }
    if (!brand) {
      throw ApiError.notFound(`Brand '${idOrSlug}' not found.`);
    }
    return brand.toJSON();
  }

  static async createBrand(data: {
    name: string;
    logo?: string;
    description?: string;
    status?: 'active' | 'inactive';
  }) {
    const slug = slugify(data.name);
    const existing = await Brand.findOne({ slug });
    if (existing) {
      throw ApiError.conflict(`Brand with name '${data.name}' already exists.`);
    }

    const brand = new Brand({
      ...data,
      slug,
    });
    await brand.save();
    return brand.toJSON();
  }

  static async updateBrand(id: string, data: any) {
    const brand = await Brand.findById(id);
    if (!brand) {
      throw ApiError.notFound('Brand not found.');
    }

    if (data.name && data.name !== brand.name) {
      data.slug = slugify(data.name);
    }

    Object.assign(brand, data);
    await brand.save();
    return brand.toJSON();
  }

  static async deleteBrand(id: string) {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      throw ApiError.notFound('Brand not found.');
    }
    return { message: 'Brand deleted successfully.' };
  }
}

