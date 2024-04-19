"use client"
import Product from "@/components/Products/Product";
import ProductSkeleton from "@/components/Products/ProductSkeleton";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { COLOR_FILTERS, SORT_OPTIONS, SUBCATEGORIES,SIZE_FILTERS, PRICE_FILTERS } from "@/constants";

import type { Product as TProduct } from '@/db'
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@upstash/vector";
import axios from "axios";
import { ChevronDown, Filter } from "lucide-react";
import debounce from 'lodash.debounce'
import { useCallback, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AVAILABLE_SIZES, ProductState } from "@/lib/validations";
import { Slider } from "@/components/ui/slider";
import EmptyState from "@/components/Products/EmptyState";

export default function Home() {
  const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number]
  const [filter, setFilter] = useState<ProductState>({
    sort : 'none',
    color :['beige', 'blue', 'green', 'purple', 'white'],
    size: ['L', 'M', 'S'],
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE  },
   
  })
 console.log(filter)
  const getProducts = async () => {
    const { data } = await axios.post<QueryResult<TProduct>[]>('http://localhost:3000/api/products',
    {
      filter : {
        sort: filter.sort,
        color :filter.color,
        size : filter.size,
        price : filter.price.range
       
        
      }
    }

    )
    return data;
  }
  const {data : products, isLoading, refetch} = useQuery({
    queryKey : ['products'],
    queryFn : getProducts
   
  })

  const onSubmit = () => refetch()
  const debouncedSubmit = debounce(onSubmit, 400)
  const _debouncedSubmit = useCallback(debouncedSubmit, [])
 const applyFilter = ({category, value} : 
  {category : keyof Omit<typeof filter, "price" | "sort"> 
  value : string
  }) => {
const isFilteredArray = filter[category].includes(value as never)
if (isFilteredArray) {
  setFilter((prev) => ({
    ...prev,
    [category]: prev[category].filter((v) => v !== value),
  }))
} else {
  setFilter((prev) => ({
    ...prev,
    [category]: [...prev[category], value],
  }))
}
_debouncedSubmit()
 }
 const minPrice = Math.min(filter.price.range[0], filter.price.range[1])
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1])
  return (
   <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
      
<h1 className="text-4xl font-bold tracking-tight ">
  High-quality cotton selection
</h1>

<div className="flex items-center">
<DropdownMenu>
  <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">Sort
  <ChevronDown className="-mr-5 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"/>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="align-end">
   {SORT_OPTIONS.map(({name, value}) => (
   <button className={cn('text-left w-full block px-4 py-2 text-sm',{
    'text-gray-900 bg-gray-100': value === filter.sort,
    'text-gray-500': value !== filter.sort,
   })} key={name} onClick={() => {
    setFilter((prev) => ({
      ...prev,
      sort : value
    }))
    _debouncedSubmit()
   }}>{name}</button>
   ))}
  </DropdownMenuContent>
</DropdownMenu>
<button className="-m-2-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
<Filter className="w-5 h-5" />
</button>
</div>
    </div>

    <section className="pb-24 pt-6 ">
<div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4 ">
  <div className="hidden lg:block ">
<ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
{SUBCATEGORIES.map((category) => (
<li key={category.name}>
 <button disabled={!category.selected} className="disabled:cursor-not-allowed disabled:opacity-60">
  {category.name}
 </button>
  </li>
))}


</ul>
<Accordion type="multiple" className="animate-none">
  <AccordionItem value="color">
<AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
<span className="font-medium text-gray-900">color</span>
</AccordionTrigger>
<AccordionContent className="pt-6 animate-none">
<ul className="space-y-4">
  {COLOR_FILTERS.options.map((color, colorIndex) => (
<li key={color.value} className="flex items-center">
 <input type="checkbox" id={`color-${colorIndex}`}  checked={filter.color.includes(color.value)} onChange={() => {
 applyFilter({
  category : 'color',
  value : color.value
 })
 }}className="h-4 w-4 rounded border-gray-300 text-indigi-600 focus:ring-indigo-500"/>
 <label htmlFor={`color-${colorIndex}`} className="ml-3 text-sm text-gray-600">
  {color.label}
  </label>
  </li>
  ))}
</ul>

</AccordionContent>
  </AccordionItem>
  

  <AccordionItem value="size">
<AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
<span className="font-medium text-gray-900">size</span>
</AccordionTrigger>
<AccordionContent className="pt-6 animate-none">
<ul className="space-y-4">
  {SIZE_FILTERS.options.map((size, sizeINDEX) => (
<li key={size.value} className="flex items-center">
 <input type="checkbox" id={`size-${sizeINDEX}`}  checked={filter.size.includes(size.value)} onChange={() => {
 applyFilter({
  category : 'size',
  value : size.value
 })
 }}className="h-4 w-4 rounded border-gray-300 text-indigi-600 focus:ring-indigo-500"/>
 <label htmlFor={`size-${sizeINDEX}`} className="ml-3 text-sm text-gray-600">
  {size.label}
  </label>
  </li>
  ))}
</ul>

</AccordionContent>
  </AccordionItem>

  <AccordionItem value="price">
<AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
<span className="font-medium text-gray-900">Price</span>
</AccordionTrigger>
<AccordionContent className="pt-6 animate-none">
<ul className="space-y-4">
  {PRICE_FILTERS.options.map((option, optionINDEX) => (
<li key={option.label} className="flex items-center">
 <input type="radio" id={`option-${optionINDEX}`}   checked={
                            !filter.price.isCustom &&
                            filter.price.range[0] === option.value[0] &&
                            filter.price.range[1] === option.value[1]
                          } onClick={() => {
 setFilter((prev => ({
  ...prev, price : {isCustom : false, range : [...option.value]}
 })))
 _debouncedSubmit()
 }}
 className="h-4 w-4 rounded border-gray-300 text-indigi-600 focus:ring-indigo-500"/>
 <label htmlFor={`option-${optionINDEX}`} className="ml-3 text-sm text-gray-600">
  {option.label}
  </label>
  </li>
  ))}

  <li className="flex justify-center flex-col gap-2">
  <div>
                        <input
                          type='radio'
                          id={`price-${PRICE_FILTERS.options.length}`}
                          onChange={() => {
        setFilter((prev) => ({
                              ...prev,
                              price: {
          isCustom: true,
                                range: [0, 100],
                              },
                            }))
                            _debouncedSubmit()
                          
                          }}
                          checked={filter.price.isCustom}
                          className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                        />
                        <label
                          htmlFor={`price-${PRICE_FILTERS.options.length}`}
                          className='ml-3 text-sm text-gray-600'>
                          Custom
                        </label>
                      </div>
<div className="flex justify-between ">
<p className="">price</p>
<div>
{filter.price.isCustom
                            ? minPrice.toFixed(0)
                            : filter.price.range[0].toFixed(0)}{' '}
                          € -{' '}
                          {filter.price.isCustom
                            ? maxPrice.toFixed(0)
                            : filter.price.range[1].toFixed(0)}{' '}
                          €
</div>
</div>
<Slider className={cn({
  'opacity : 50 ' : !filter.price.isCustom 
})} disabled={!filter.price.isCustom} 
onValueChange={(range) => {
  const [newMin, newMax] = range

  setFilter((prev) => ({
    ...prev,
    price: {
      isCustom: true,
      range: [newMin, newMax],
    },
  }))

  _debouncedSubmit()
}} value={
  filter.price.isCustom
    ? filter.price.range
    : DEFAULT_CUSTOM_PRICE
} 

min={DEFAULT_CUSTOM_PRICE[0]}
                        defaultValue={DEFAULT_CUSTOM_PRICE}
                        max={DEFAULT_CUSTOM_PRICE[1]}
                        step={5}/>
  </li>
</ul>

</AccordionContent>
  </AccordionItem>
</Accordion>
  </div>
<ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
  
{
  isLoading ? (
    new Array(12)
      .fill(null)
      .map((_, i) => <ProductSkeleton key={i} />)
  ) : products && products.length === 0 ? (
    <EmptyState />
  ) : 
    products?.map((product) => (
      <Product product={product.metadata!} />
    ))
  
}

</ul>
</div>
    </section>
   </main>
  );
}
