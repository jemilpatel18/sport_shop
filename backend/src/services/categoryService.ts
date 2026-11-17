import { Category } from '../models/Category';
import { ApiError } from '../utils/apiError';
import { slugify } from '../utils/helpers';

export class CategoryService {
  static async getCategories(activeOnly = true) {
    const query = activeOnly ? { status: 'active' } : {};
    const categories = await Category.find(query).sort({ name: 1 });
    return categories.map((c) => c.toJSON());
  }

  static async getCategoryByIdOrSlug(idOrSlug: string) {
    let category;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(idOrSlug);
    }
    if (!category) {
      category = await Category.findOne({ slug: idOrSlug.toLowerCase() });
    }
    if (!category) {
      throw ApiError.notFound(`Category '${idOrSlug}' not found.`);
    }
    return category.toJSON();
  }

  static async createCategory(data: {
    name: string;
    description?: string;
    image?: string;
    featured?: boolean;
    status?: 'active' | 'inactive';
  }) {
    const slug = slugify(data.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      throw ApiError.conflict(`Category with name '${data.name}' already exists.`);
    }

    const category = new Category({
      ...data,
      slug,
    });
    await category.save();
    return category.toJSON();
  }

  static async updateCategory(id: string, data: any) {
    const category = await Category.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found.');
    }

    if (data.name && data.name !== category.name) {
      data.slug = slugify(data.name);
    }

    Object.assign(category, data);
    await category.save();
    return category.toJSON();
  }

  static async deleteCategory(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw ApiError.notFound('Category not found.');
    }
    return { message: 'Category deleted successfully.' };
  }
}

